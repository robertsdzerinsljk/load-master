<?php

namespace App\Services\Simulator;

use App\Models\SimulationAttempt;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class SimulationTimelineService
{
    public function __construct(
        private readonly RouteFuelPlanService $routeFuelPlanService
    ) {
    }

    public function build(SimulationAttempt $attempt): array
    {
        $attempt->loadMissing([
            'orderTemplate',
            'orderTemplate.startLocation',
            'orderTemplate.endLocation',
            'orderTemplate.startPort.location',
            'orderTemplate.endPort.location',
            'selectedTransportTemplate',
            'selectedPort.location',
            'selectedShip',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'routeSegments.fuelStops.fuelStation.location',
            'fuelStations.location',
        ]);

        $template = $attempt->orderTemplate;
        $transport = $attempt->selectedTransportTemplate;
        $port = $attempt->selectedPort;
        $ship = $attempt->selectedShip;

        $segments = $attempt->routeSegments->sortBy('pivot.position')->values();
        $fuelStations = $attempt->fuelStations->sortBy('pivot.position')->values();

        $config = is_array($template->scenario_config) ? $template->scenario_config : [];
        $timing = is_array($config['timing'] ?? null) ? $config['timing'] : [];
        $availability = is_array($config['availability'] ?? null) ? $config['availability'] : [];
        $costs = is_array($config['costs'] ?? null) ? $config['costs'] : [];

        $containerCount = (int) ($template->cargo_amount_containers ?? 0);
        $vehicleCount = max(1, (int) ($attempt->selected_vehicle_count ?? 1));

        $vehicleCapacity = (int) (
            $transport->capacity_containers
            ?? $transport->container_capacity
            ?? 0
        );

        $capacityPerTrip = max(1, $vehicleCapacity * $vehicleCount);
        $requiredTrips = $capacityPerTrip > 0
            ? (int) ceil($containerCount / $capacityPerTrip)
            : 1;

        $avgSpeed = (float) (
            $transport->avg_speed_kmh
            ?? $transport->average_speed_kmh
            ?? 70
        );

        $defaultLoadingMinutes = (int) ($timing['loading_fixed_minutes'] ?? 45);
        $defaultFuelStopMinutes = (int) ($timing['fuel_stop_minutes'] ?? 20);
        $defaultPortProcessingMinutes = (int) ($timing['port_processing_minutes'] ?? 60);
        $defaultShipLoadingMinutes = (int) ($timing['ship_loading_minutes'] ?? 90);
        $defaultSeaTransitMinutes = (int) ($timing['sea_transit_minutes'] ?? 360);
        $maxDriveMinutesBeforeRest = (int) ($timing['max_drive_minutes_before_rest'] ?? 270);
        $restMinutes = (int) ($timing['rest_minutes'] ?? 45);
        $resolvedPortProcessingMinutes = (int) ceil((float) ($attempt->unloading_duration_minutes ?? $defaultPortProcessingMinutes));
        $resolvedShipLoadingMinutes = (int) ceil((float) ($attempt->loading_duration_minutes ?? $defaultShipLoadingMinutes));

        $dayShiftStartHour = (int) ($costs['day_shift_start_hour'] ?? 6);
        $nightShiftStartHour = (int) ($costs['night_shift_start_hour'] ?? 20);
        $laborCostPerHourDay = (float) ($costs['labor_cost_per_hour_day'] ?? 18);
        $machineCostPerHourDay = (float) ($costs['machine_cost_per_hour_day'] ?? 30);
        $nightShiftMultiplier = (float) ($costs['night_shift_multiplier'] ?? 1.35);

        $portQueueMinutes = (int) ($availability['port_queue_minutes'] ?? 0);
        $shipReadyAt = !empty($availability['ship_ready_at'])
            ? Carbon::parse($availability['ship_ready_at'])
            : null;

        $events = [];

        $current = $template->scenario_start_at
            ? Carbon::parse($template->scenario_start_at)
            : now()->copy();

        $startedAt = $current->copy();
        $drivingMinutesSinceRest = 0;
        $startLocationName = $segments->first()?->fromLocation?->name
            ?? $template->startLocation?->name
            ?? $template->startPort?->name
            ?? 'Sakuma punkts';
        $endLocationName = $segments->last()?->toLocation?->name
            ?? $template->endLocation?->name
            ?? $template->endPort?->name
            ?? 'Galamerkis';
        $totalRouteDistanceKm = (float) $segments->sum(fn ($segment) => (float) ($segment->distance_km ?? 0));
        $returnTripMinutes = $avgSpeed > 0
            ? (int) ceil(($totalRouteDistanceKm / $avgSpeed) * 60)
            : 0;

        $mappedFuelStops = $this->routeFuelPlanService->mapRouteFuelStops($segments);
        $selectedFuelPlan = $this->routeFuelPlanService->resolveSelectedFuelPlan(
            $fuelStations,
            $mappedFuelStops,
            round($totalRouteDistanceKm, 2),
            (float) ($transport->max_range_km ?? 0)
        );
        $selectedStopsBySegment = collect($selectedFuelPlan['selected_positions'] ?? [])
            ->filter(fn (array $stop) => ($stop['is_logical'] ?? false) && !empty($stop['segment_id']))
            ->groupBy('segment_id');

        if ($containerCount > 0) {
            $loadingMinutes = $defaultLoadingMinutes;

            $events[] = $this->makeEvent(
                type: 'loading',
                label: 'Kravas sakotneja iekrausana',
                start: $current,
                durationMinutes: $loadingMinutes,
                meta: [
                    'containers' => $containerCount,
                    'vehicles' => $vehicleCount,
                    'location_name' => $startLocationName,
                    'transport_name' => $transport?->name,
                ],
                costProfile: [
                    'labor_units' => 2,
                    'machine_units' => 1,
                ],
                dayShiftStartHour: $dayShiftStartHour,
                nightShiftStartHour: $nightShiftStartHour,
                laborCostPerHourDay: $laborCostPerHourDay,
                machineCostPerHourDay: $machineCostPerHourDay,
                nightShiftMultiplier: $nightShiftMultiplier,
            );

            $current = $current->copy()->addMinutes($loadingMinutes);
        }

        for ($trip = 1; $trip <= $requiredTrips; $trip++) {
            foreach ($segments as $index => $segment) {
                $distanceKm = (float) ($segment->distance_km ?? 0);
                $from = $segment->fromLocation->name ?? '---';
                $to = $segment->toLocation->name ?? '---';
                $segmentStartName = $from;
                $distanceCoveredOnSegment = 0.0;
                $segmentFuelStops = collect($selectedStopsBySegment->get($segment->id, []))
                    ->sortBy('distance_from_segment_start_km')
                    ->values();

                foreach ($segmentFuelStops as $stop) {
                    $stopDistanceFromSegmentStart = (float) ($stop['distance_from_segment_start_km'] ?? 0);
                    $legDistanceKm = max(0.0, round($stopDistanceFromSegmentStart - $distanceCoveredOnSegment, 2));
                    $driveMinutes = $this->distanceToMinutes($legDistanceKm, $avgSpeed);

                    $current = $this->appendDriveAndRestEvents(
                        $events,
                        $current,
                        $trip,
                        $segmentStartName,
                        $stop['station']->location_name ?? $stop['station']->location?->name ?? 'Degvielas pietura',
                        $legDistanceKm,
                        $avgSpeed,
                        $driveMinutes,
                        $maxDriveMinutesBeforeRest,
                        $restMinutes,
                        $drivingMinutesSinceRest,
                        [
                            'segment_position' => $index + 1,
                            'segment_id' => $segment->id,
                        ],
                        $dayShiftStartHour,
                        $nightShiftStartHour
                    );

                    $station = $stop['station'];
                    $stationName = $station->display_name ?? $station->name ?? 'Degvielas pietura';

                    $events[] = $this->makeEvent(
                        type: 'fuel_stop',
                        label: "Reiss {$trip}: Uzpilde {$stationName}",
                        start: $current,
                        durationMinutes: $defaultFuelStopMinutes,
                        meta: [
                            'trip' => $trip,
                            'station_id' => $station->id,
                            'station_name' => $stationName,
                            'location_name' => $station->location_name ?? $station->location?->name,
                            'distance_from_start_km' => $stop['distance_from_start_km'] ?? null,
                            'segment_id' => $segment->id,
                        ],
                        costProfile: [
                            'labor_units' => 1,
                            'machine_units' => 1,
                        ],
                        dayShiftStartHour: $dayShiftStartHour,
                        nightShiftStartHour: $nightShiftStartHour,
                        laborCostPerHourDay: $laborCostPerHourDay,
                        machineCostPerHourDay: $machineCostPerHourDay,
                        nightShiftMultiplier: $nightShiftMultiplier,
                    );

                    $current = $current->copy()->addMinutes($defaultFuelStopMinutes);
                    $segmentStartName = $station->location_name ?? $station->location?->name ?? $segmentStartName;
                    $distanceCoveredOnSegment = $stopDistanceFromSegmentStart;
                }

                $remainingDistanceKm = max(0.0, round($distanceKm - $distanceCoveredOnSegment, 2));
                $remainingDriveMinutes = $this->distanceToMinutes($remainingDistanceKm, $avgSpeed);

                $current = $this->appendDriveAndRestEvents(
                    $events,
                    $current,
                    $trip,
                    $segmentStartName,
                    $to,
                    $remainingDistanceKm,
                    $avgSpeed,
                    $remainingDriveMinutes,
                    $maxDriveMinutesBeforeRest,
                    $restMinutes,
                        $drivingMinutesSinceRest,
                        [
                            'segment_position' => $index + 1,
                            'segment_id' => $segment->id,
                        ],
                        $dayShiftStartHour,
                        $nightShiftStartHour
                    );
            }

            if ($trip < $requiredTrips && $returnTripMinutes > 0) {
                if ($maxDriveMinutesBeforeRest > 0) {
                    while ($drivingMinutesSinceRest > 0
                        && ($drivingMinutesSinceRest + $returnTripMinutes) > $maxDriveMinutesBeforeRest
                    ) {
                        $events[] = $this->makeEvent(
                            type: 'rest',
                            label: "Obligata atputa pirms atgriesanas (Reiss {$trip})",
                            start: $current,
                            durationMinutes: $restMinutes,
                            meta: [
                                'trip' => $trip,
                                'reason' => 'max_drive_limit_reached',
                                'max_drive_minutes_before_rest' => $maxDriveMinutesBeforeRest,
                            ],
                            costProfile: [
                                'labor_units' => 0,
                                'machine_units' => 0,
                            ],
                            dayShiftStartHour: $dayShiftStartHour,
                            nightShiftStartHour: $nightShiftStartHour,
                            laborCostPerHourDay: $laborCostPerHourDay,
                            machineCostPerHourDay: $machineCostPerHourDay,
                            nightShiftMultiplier: $nightShiftMultiplier,
                        );

                        $current = $current->copy()->addMinutes($restMinutes);
                        $drivingMinutesSinceRest = 0;
                    }
                }

                $events[] = $this->makeEvent(
                    type: 'return',
                    label: "Atgriesanas uz sakuma punktu (Reiss {$trip})",
                    start: $current,
                    durationMinutes: $returnTripMinutes,
                    meta: [
                        'trip' => $trip,
                        'distance_km' => $totalRouteDistanceKm,
                        'from_location_name' => $endLocationName,
                        'to_location_name' => $startLocationName,
                    ],
                    costProfile: [
                        'labor_units' => 0,
                        'machine_units' => 0,
                    ],
                    dayShiftStartHour: $dayShiftStartHour,
                    nightShiftStartHour: $nightShiftStartHour,
                    laborCostPerHourDay: $laborCostPerHourDay,
                    machineCostPerHourDay: $machineCostPerHourDay,
                    nightShiftMultiplier: $nightShiftMultiplier,
                );

                $current = $current->copy()->addMinutes($returnTripMinutes);
                $drivingMinutesSinceRest += $returnTripMinutes;
            }
        }

        if ($port && $portQueueMinutes > 0) {
            $events[] = $this->makeEvent(
                type: 'waiting',
                label: "Gaidisana ostas rinda: {$port->name}",
                start: $current,
                durationMinutes: $portQueueMinutes,
                meta: [
                    'reason' => 'port_queue',
                    'port_id' => $port->id,
                    'port_name' => $port->name,
                    'location_name' => $port->location?->name ?? $port->name,
                ],
                costProfile: [
                    'labor_units' => 0,
                    'machine_units' => 0,
                ],
                dayShiftStartHour: $dayShiftStartHour,
                nightShiftStartHour: $nightShiftStartHour,
                laborCostPerHourDay: $laborCostPerHourDay,
                machineCostPerHourDay: $machineCostPerHourDay,
                nightShiftMultiplier: $nightShiftMultiplier,
            );

            $current = $current->copy()->addMinutes($portQueueMinutes);
        }

        if ($port) {
            $events[] = $this->makeEvent(
                type: 'port_processing',
                label: "Ostas apstrade: {$port->name}",
                start: $current,
                durationMinutes: $resolvedPortProcessingMinutes,
                meta: [
                    'port_id' => $port->id,
                    'port_name' => $port->name,
                    'location_name' => $port->location?->name ?? $port->name,
                ],
                costProfile: [
                    'labor_units' => 3,
                    'machine_units' => 2,
                ],
                dayShiftStartHour: $dayShiftStartHour,
                nightShiftStartHour: $nightShiftStartHour,
                laborCostPerHourDay: $laborCostPerHourDay,
                machineCostPerHourDay: $machineCostPerHourDay,
                nightShiftMultiplier: $nightShiftMultiplier,
            );

            $current = $current->copy()->addMinutes($resolvedPortProcessingMinutes);
        }

        if ($ship && $shipReadyAt && $current->lessThan($shipReadyAt)) {
            $waitMinutes = $current->diffInMinutes($shipReadyAt);

            $events[] = $this->makeEvent(
                type: 'waiting',
                label: "Gaidisana lidz kugis gatavs: {$ship->name}",
                start: $current,
                durationMinutes: $waitMinutes,
                meta: [
                    'reason' => 'ship_ready_window',
                    'ship_id' => $ship->id,
                    'ship_name' => $ship->name,
                    'ready_at' => $shipReadyAt->toDateTimeString(),
                    'port_name' => $port?->name,
                    'location_name' => $port?->location?->name ?? $port?->name,
                ],
                costProfile: [
                    'labor_units' => 0,
                    'machine_units' => 0,
                ],
                dayShiftStartHour: $dayShiftStartHour,
                nightShiftStartHour: $nightShiftStartHour,
                laborCostPerHourDay: $laborCostPerHourDay,
                machineCostPerHourDay: $machineCostPerHourDay,
                nightShiftMultiplier: $nightShiftMultiplier,
            );

            $current = $shipReadyAt->copy();
        }

        if ($ship) {
            $events[] = $this->makeEvent(
                type: 'ship_loading',
                label: "Iekrausana kugi: {$ship->name}",
                start: $current,
                durationMinutes: $resolvedShipLoadingMinutes,
                meta: [
                    'ship_id' => $ship->id,
                    'ship_name' => $ship->name,
                    'port_name' => $port?->name,
                    'location_name' => $port?->location?->name ?? $port?->name,
                ],
                costProfile: [
                    'labor_units' => 4,
                    'machine_units' => 2,
                ],
                dayShiftStartHour: $dayShiftStartHour,
                nightShiftStartHour: $nightShiftStartHour,
                laborCostPerHourDay: $laborCostPerHourDay,
                machineCostPerHourDay: $machineCostPerHourDay,
                nightShiftMultiplier: $nightShiftMultiplier,
            );

            $current = $current->copy()->addMinutes($resolvedShipLoadingMinutes);
        }

        $departurePortName = $port?->name
            ?? $template->startPort?->name
            ?? $template->startLocation?->name
            ?? 'Izbrauksanas punkts';
        $arrivalPortName = $template->endPort?->name
            ?? $template->endLocation?->name
            ?? null;

        if ($ship && $arrivalPortName && $arrivalPortName !== $departurePortName) {
            $events[] = $this->makeEvent(
                type: 'sea_transit',
                label: "{$ship->name} dodas uz {$arrivalPortName}",
                start: $current,
                durationMinutes: $defaultSeaTransitMinutes,
                meta: [
                    'ship_id' => $ship->id,
                    'ship_name' => $ship->name,
                    'origin_port_name' => $departurePortName,
                    'destination_port_name' => $arrivalPortName,
                    'mode' => 'sea',
                ],
                costProfile: [
                    'labor_units' => 0,
                    'machine_units' => 0,
                ],
                dayShiftStartHour: $dayShiftStartHour,
                nightShiftStartHour: $nightShiftStartHour,
                laborCostPerHourDay: $laborCostPerHourDay,
                machineCostPerHourDay: $machineCostPerHourDay,
                nightShiftMultiplier: $nightShiftMultiplier,
            );

            $current = $current->copy()->addMinutes($defaultSeaTransitMinutes);
        }

        $finishedAt = $current->copy();
        $totalMinutes = $startedAt->diffInMinutes($finishedAt);

        $deadlineAt = $template->deadline_at
            ? Carbon::parse($template->deadline_at)
            : null;

        if (!$deadlineAt && $template->deadline_date) {
            $deadlineAt = Carbon::parse($template->deadline_date)->endOfDay();
        }

        $delayMinutes = 0;
        $isWithinDeadline = true;

        if ($deadlineAt && $finishedAt->greaterThan($deadlineAt)) {
            $delayMinutes = $deadlineAt->diffInMinutes($finishedAt);
            $isWithinDeadline = false;
        }

        $operationsTotal = round((float) collect($events)->sum(fn (array $event) => (float) ($event['meta']['expense_total_eur'] ?? 0)), 2);
        $dayOperations = round((float) collect($events)->sum(fn (array $event) => (float) ($event['meta']['expense_day_eur'] ?? 0)), 2);
        $nightOperations = round((float) collect($events)->sum(fn (array $event) => (float) ($event['meta']['expense_night_eur'] ?? 0)), 2);
        $dayOperationMinutes = (int) collect($events)->sum(fn (array $event) => (int) ($event['meta']['expense_day_minutes'] ?? 0));
        $nightOperationMinutes = (int) collect($events)->sum(fn (array $event) => (int) ($event['meta']['expense_night_minutes'] ?? 0));

        return [
            'events' => $events,
            'summary' => [
                'started_at' => $startedAt->toDateTimeString(),
                'finished_at' => $finishedAt->toDateTimeString(),
                'total_minutes' => $totalMinutes,
                'total_hours' => round($totalMinutes / 60, 2),
                'deadline_at' => $deadlineAt?->toDateTimeString(),
                'delay_minutes' => $delayMinutes,
                'is_within_deadline' => $isWithinDeadline,
            ],
            'costs' => [
                'operations_total_eur' => $operationsTotal,
                'day_operations_eur' => $dayOperations,
                'night_operations_eur' => $nightOperations,
                'day_operation_minutes' => $dayOperationMinutes,
                'night_operation_minutes' => $nightOperationMinutes,
                'night_shift_multiplier' => $nightShiftMultiplier,
            ],
        ];
    }

    private function appendDriveAndRestEvents(
        array &$events,
        CarbonInterface $current,
        int $trip,
        string $from,
        string $to,
        float $distanceKm,
        float $avgSpeed,
        int $driveMinutes,
        int $maxDriveMinutesBeforeRest,
        int $restMinutes,
        int &$drivingMinutesSinceRest,
        array $meta = [],
        int $dayShiftStartHour = 6,
        int $nightShiftStartHour = 20
    ): CarbonInterface {
        if ($driveMinutes > 0 && $maxDriveMinutesBeforeRest > 0) {
            while ($drivingMinutesSinceRest > 0
                && ($drivingMinutesSinceRest + $driveMinutes) > $maxDriveMinutesBeforeRest
            ) {
                $events[] = $this->makeEvent(
                    type: 'rest',
                    label: "Obligata atputa pirms reisa {$trip} turpinajuma",
                    start: $current,
                    durationMinutes: $restMinutes,
                    meta: [
                        'trip' => $trip,
                        'reason' => 'max_drive_limit_reached',
                        'max_drive_minutes_before_rest' => $maxDriveMinutesBeforeRest,
                    ],
                    costProfile: [
                        'labor_units' => 0,
                        'machine_units' => 0,
                    ],
                    dayShiftStartHour: $dayShiftStartHour,
                    nightShiftStartHour: $nightShiftStartHour,
                    laborCostPerHourDay: 0,
                    machineCostPerHourDay: 0,
                    nightShiftMultiplier: 1
                );

                $current = $current->copy()->addMinutes($restMinutes);
                $drivingMinutesSinceRest = 0;
            }
        }

        if ($driveMinutes > 0) {
            $events[] = $this->makeEvent(
                type: 'drive',
                label: "Reiss {$trip}: {$from} -> {$to}",
                start: $current,
                durationMinutes: $driveMinutes,
                meta: array_merge([
                    'trip' => $trip,
                    'distance_km' => $distanceKm,
                    'avg_speed_kmh' => $avgSpeed,
                    'from_location_name' => $from,
                    'to_location_name' => $to,
                ], $meta),
                costProfile: [
                    'labor_units' => 0,
                    'machine_units' => 0,
                ],
                dayShiftStartHour: $dayShiftStartHour,
                nightShiftStartHour: $nightShiftStartHour,
                laborCostPerHourDay: 0,
                machineCostPerHourDay: 0,
                nightShiftMultiplier: 1
            );

            $current = $current->copy()->addMinutes($driveMinutes);
            $drivingMinutesSinceRest += $driveMinutes;
        }

        return $current;
    }

    private function makeEvent(
        string $type,
        string $label,
        CarbonInterface $start,
        int $durationMinutes,
        array $meta = [],
        array $costProfile = [],
        int $dayShiftStartHour = 6,
        int $nightShiftStartHour = 20,
        float $laborCostPerHourDay = 0,
        float $machineCostPerHourDay = 0,
        float $nightShiftMultiplier = 1
    ): array {
        $startAt = Carbon::parse($start);
        $end = $startAt->copy()->addMinutes(max(0, $durationMinutes));
        $expense = $this->calculateEventExpense(
            $startAt,
            $end,
            max(0, $durationMinutes),
            (float) ($costProfile['labor_units'] ?? 0),
            (float) ($costProfile['machine_units'] ?? 0),
            $dayShiftStartHour,
            $nightShiftStartHour,
            $laborCostPerHourDay,
            $machineCostPerHourDay,
            $nightShiftMultiplier
        );

        return [
            'type' => $type,
            'label' => $label,
            'start_at' => $startAt->toDateTimeString(),
            'end_at' => $end->toDateTimeString(),
            'duration_minutes' => max(0, $durationMinutes),
            'meta' => array_merge($meta, $expense),
        ];
    }

    private function calculateEventExpense(
        CarbonInterface $start,
        CarbonInterface $end,
        int $durationMinutes,
        float $laborUnits,
        float $machineUnits,
        int $dayShiftStartHour,
        int $nightShiftStartHour,
        float $laborCostPerHourDay,
        float $machineCostPerHourDay,
        float $nightShiftMultiplier
    ): array {
        $shiftSplit = $this->splitShiftMinutes($start, $end, $dayShiftStartHour, $nightShiftStartHour);
        $baseHourlyRate = ($laborUnits * $laborCostPerHourDay) + ($machineUnits * $machineCostPerHourDay);
        $dayCost = round(($shiftSplit['day_minutes'] / 60) * $baseHourlyRate, 2);
        $nightCost = round(($shiftSplit['night_minutes'] / 60) * $baseHourlyRate * $nightShiftMultiplier, 2);
        $phase = $this->isNightHour((int) $start->copy()->hour, $dayShiftStartHour, $nightShiftStartHour)
            ? 'night'
            : 'day';

        return [
            'phase' => $phase,
            'expense_total_eur' => round($dayCost + $nightCost, 2),
            'expense_day_eur' => $dayCost,
            'expense_night_eur' => $nightCost,
            'expense_day_minutes' => $shiftSplit['day_minutes'],
            'expense_night_minutes' => $shiftSplit['night_minutes'],
            'expense_labor_units' => $laborUnits,
            'expense_machine_units' => $machineUnits,
            'night_shift_multiplier' => $nightShiftMultiplier,
            'has_night_cost' => $shiftSplit['night_minutes'] > 0,
            'is_operational_costed' => $baseHourlyRate > 0 && $durationMinutes > 0,
        ];
    }

    private function splitShiftMinutes(
        CarbonInterface $start,
        CarbonInterface $end,
        int $dayShiftStartHour,
        int $nightShiftStartHour
    ): array {
        $cursor = $start->copy();
        $dayMinutes = 0;
        $nightMinutes = 0;

        while ($cursor->lessThan($end)) {
            $nextBoundary = $this->nextShiftBoundary($cursor, $dayShiftStartHour, $nightShiftStartHour);
            $windowEnd = $nextBoundary->lessThan($end) ? $nextBoundary : $end;
            $minutes = $cursor->diffInMinutes($windowEnd);

            if ($this->isNightHour((int) $cursor->hour, $dayShiftStartHour, $nightShiftStartHour)) {
                $nightMinutes += $minutes;
            } else {
                $dayMinutes += $minutes;
            }

            $cursor = $windowEnd->copy();
        }

        return [
            'day_minutes' => $dayMinutes,
            'night_minutes' => $nightMinutes,
        ];
    }

    private function nextShiftBoundary(CarbonInterface $current, int $dayShiftStartHour, int $nightShiftStartHour): CarbonInterface
    {
        $dayBoundary = $current->copy()->setTime($dayShiftStartHour, 0);
        $nightBoundary = $current->copy()->setTime($nightShiftStartHour, 0);

        if ($dayBoundary->lessThanOrEqualTo($current)) {
            $dayBoundary->addDay();
        }

        if ($nightBoundary->lessThanOrEqualTo($current)) {
            $nightBoundary->addDay();
        }

        return $dayBoundary->lessThan($nightBoundary) ? $dayBoundary : $nightBoundary;
    }

    private function isNightHour(int $hour, int $dayShiftStartHour, int $nightShiftStartHour): bool
    {
        return $hour < $dayShiftStartHour || $hour >= $nightShiftStartHour;
    }

    private function distanceToMinutes(float $distanceKm, float $avgSpeed): int
    {
        if ($distanceKm <= 0 || $avgSpeed <= 0) {
            return 0;
        }

        return (int) ceil(($distanceKm / $avgSpeed) * 60);
    }
}
