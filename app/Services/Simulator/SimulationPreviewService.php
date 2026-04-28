<?php

namespace App\Services\Simulator;

use App\Models\SimulationAttempt;
use App\Services\HandlingDurationCalculator;
use App\Services\HandlingValidator;

class SimulationPreviewService
{
    public function __construct(
        private readonly SimulationTimelineService $timelineService,
        private readonly RouteFuelPlanService $routeFuelPlanService,
        private readonly ScenarioCompatibilityService $compatibilityService,
        private readonly HandlingValidator $handlingValidator,
        private readonly HandlingDurationCalculator $handlingDurationCalculator
    ) {
    }

    public function build(SimulationAttempt $attempt): array
    {
        $attempt->loadMissing([
            'orderTemplate',
            'selectedTransportTemplate',
            'selectedPort.handlingMethods',
            'selectedShip.handlingMethods',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'routeSegments.fuelStops.fuelStation.location',
            'fuelStations.location',
        ]);

        $template = $attempt->orderTemplate;
        $transport = $attempt->selectedTransportTemplate;
        $port = $attempt->selectedPort;
        $ship = $attempt->selectedShip;

        $config = is_array($template->scenario_config) ? $template->scenario_config : [];
        $scoring = is_array($config['scoring'] ?? null) ? $config['scoring'] : [];
        $costConfig = is_array($config['costs'] ?? null) ? $config['costs'] : [];
        $compatibilityRules = is_array($config['compatibility'] ?? null)
            ? $config['compatibility']
            : [];

        $timeWeight = (int) ($scoring['time_weight'] ?? 35);
        $costWeight = (int) ($scoring['cost_weight'] ?? 25);
        $compatibilityWeight = (int) ($scoring['compatibility_weight'] ?? 25);
        $tripsWeight = (int) ($scoring['trips_weight'] ?? 15);

        $enforcePortCargoSupport = (bool) ($compatibilityRules['enforce_port_cargo_support'] ?? true);
        $enforceShipCargoSupport = (bool) ($compatibilityRules['enforce_ship_cargo_support'] ?? true);
        $enforcePortShipDraft = (bool) ($compatibilityRules['enforce_port_ship_draft'] ?? true);
        $enforceHandlingCompatibility = (bool) ($compatibilityRules['enforce_handling_compatibility'] ?? true);

        $segments = $attempt->routeSegments->sortBy('pivot.position')->values();
        $fuelStations = $attempt->fuelStations->sortBy('pivot.position')->values();

        $containerCount = (int) ($template->cargo_amount_containers ?? 0);
        $vehicleCount = max(1, (int) ($attempt->selected_vehicle_count ?? 1));

        $vehicleCapacity = (int) (
            $transport->capacity_containers
            ?? $transport->container_capacity
            ?? 1
        );

        $capacityPerTrip = max(1, $vehicleCapacity * $vehicleCount);
        $requiredTrips = (int) ceil($containerCount / $capacityPerTrip);

        $avgSpeed = (float) (
            $transport->avg_speed_kmh
            ?? $transport->average_speed_kmh
            ?? 70
        );

        $fuelPer100Km = (float) ($transport->fuel_consumption_per_100km ?? 28);
        $costPerKm = (float) ($transport->cost_per_km ?? 1.2);
        $maxRangeKm = (float) ($transport->max_range_km ?? 800);
        $defaultFuelPricePerLiter = (float) ($costConfig['default_fuel_price_per_liter'] ?? 1.65);

        $totalDistanceKm = round(
            $segments->sum(fn ($segment) => (float) ($segment->distance_km ?? 0)),
            2
        );
        $outboundDistanceKm = $totalDistanceKm * $requiredTrips;
        $returnDistanceKm = $totalDistanceKm * max(0, $requiredTrips - 1);
        $totalDrivenDistanceKm = round(($outboundDistanceKm + $returnDistanceKm) * $vehicleCount, 2);

        $requiredVehicles = (int) ceil($containerCount / max(1, $vehicleCapacity));
        $tripTimeHours = $avgSpeed > 0 ? round($totalDistanceKm / $avgSpeed, 2) : 0.0;
        $fuelNeededLiters = round(($totalDrivenDistanceKm / 100) * $fuelPer100Km, 2);
        $transportCost = round($totalDrivenDistanceKm * $costPerKm, 2);

        $hasEnoughVehicles = $vehicleCount >= $requiredVehicles;
        $chainValid = true;
        $warnings = [];

        if ($segments->count() === 0) {
            $chainValid = false;
            $warnings[] = 'Nav izvelets neviens marsruta segments.';
        }

        for ($i = 0; $i < $segments->count() - 1; $i++) {
            $currentTo = $segments[$i]->toLocation->name ?? null;
            $nextFrom = $segments[$i + 1]->fromLocation->name ?? null;

            if ($currentTo !== $nextFrom) {
                $chainValid = false;
                $warnings[] = 'Marsruta segmenti neveido nepartrauktu kedi.';
                break;
            }
        }

        $fuelStopsCount = $fuelStations->count();
        $mappedFuelStops = $this->routeFuelPlanService->mapRouteFuelStops($segments);
        $selectedFuelPlan = $this->routeFuelPlanService->resolveSelectedFuelPlan(
            $fuelStations,
            $mappedFuelStops,
            $totalDistanceKm,
            $maxRangeKm
        );
        $approxLegDistance = $selectedFuelPlan['approx_leg_distance_km'];

        $needsRefuel = $totalDistanceKm > $maxRangeKm;
        $rangePlanValid = $selectedFuelPlan['range_plan_valid'];
        $fuelSelectionsLogical = $selectedFuelPlan['logical'];
        $fuelPrice = $this->resolveFuelPricePerLiter(
            $selectedFuelPlan,
            $fuelStations,
            $mappedFuelStops,
            $defaultFuelPricePerLiter
        );
        $fuelPricePerLiter = $fuelPrice['price'];
        $fuelPriceSource = $fuelPrice['source'];
        $fuelCost = round($fuelNeededLiters * $fuelPricePerLiter, 2);
        $totalJourneyNeedsRefuel = $maxRangeKm > 0 && $totalDrivenDistanceKm > $maxRangeKm;
        $estimatedTankLoads = $maxRangeKm > 0
            ? (int) ceil($totalDrivenDistanceKm / $maxRangeKm)
            : 1;
        $estimatedRefuelEvents = max(0, $estimatedTankLoads - 1);
        $assumesDepotRefuel = $totalJourneyNeedsRefuel && !$needsRefuel;

        if (!$hasEnoughVehicles) {
            $warnings[] = 'Izveleto transportu skaits nav pietiekams visai kravai.';
        }

        if ($needsRefuel && $fuelStopsCount === 0) {
            $warnings[] = 'Marsruta attalums parsniedz transporta darbibas radiusu, bet nav izveleta neviena degvielas pietura.';
        }

        if (!$rangePlanValid) {
            $warnings[] = 'Pat ar izveleto degvielas pieturu skaitu marsruts ir parak gars starp uzpildem.';
        }

        if ($fuelNeededLiters > 0 && $fuelPriceSource === 'default') {
            $warnings[] = "Degvielas pieturai nav cenas; izmanto noklusejuma cenu {$fuelPricePerLiter} EUR/L.";
        }

        if ($assumesDepotRefuel) {
            $warnings[] = "Kopejais nobraukums parsniedz vienas bakas distanci; aprekinats, ka starp reisiem vajadzigas {$estimatedRefuelEvents} uzpildes.";
        }

        foreach ($selectedFuelPlan['issues'] as $issue) {
            $warnings[] = $issue;
        }

        $portDepth = (float) ($port->max_draft_m ?? 0);
        $shipDraft = (float) ($ship->draft_m ?? 0);
        $shipCapacityContainers = (int) (
            $ship->capacity_containers_value
            ?? $ship->capacity_containers
            ?? $ship->container_capacity
            ?? 0
        );

        $compatibility = $this->compatibilityService->inspectAttempt($attempt);
        $handlingValidation = $this->handlingValidator->validate($attempt);
        $handlingDurations = $this->handlingDurationCalculator->calculate($attempt);

        $resourceCompatibilityValid = true;

        if (!$port) {
            $warnings[] = 'Nav izveleta osta.';
            $resourceCompatibilityValid = false;
        }

        if (!$ship) {
            $warnings[] = 'Nav izvelets kugis.';
            $resourceCompatibilityValid = false;
        }

        if ($enforcePortCargoSupport && !($compatibility['port']['compatible'] ?? true)) {
            foreach ($compatibility['port']['reasons'] ?? [] as $reason) {
                $warnings[] = $reason;
            }

            $resourceCompatibilityValid = false;
        }

        if ($enforceShipCargoSupport && !($compatibility['ship']['compatible'] ?? true)) {
            foreach ($compatibility['ship']['reasons'] ?? [] as $reason) {
                $warnings[] = $reason;
            }

            $resourceCompatibilityValid = false;
        }

        if ($enforcePortShipDraft && !($compatibility['pair']['compatible'] ?? true)) {
            foreach ($compatibility['pair']['reasons'] ?? [] as $reason) {
                $warnings[] = $reason;
            }

            $resourceCompatibilityValid = false;
        }

        if ($ship && $containerCount > 0 && $shipCapacityContainers > 0 && $containerCount > $shipCapacityContainers) {
            $warnings[] = 'Izveleta kuga ietilpiba nav pietiekama visai kravai.';
            $resourceCompatibilityValid = false;
        }

        if ($enforceHandlingCompatibility && !($handlingValidation['valid'] ?? false)) {
            foreach ($handlingValidation['errors'] ?? [] as $reason) {
                $warnings[] = $reason;
            }
        }

        $timeline = $this->timelineService->build($attempt);
        $operationsCost = round((float) data_get($timeline, 'costs.operations_total_eur', 0), 2);
        $totalCost = round($transportCost + $fuelCost + $operationsCost, 2);
        $totalOperationHours = round(((int) ($timeline['summary']['total_minutes'] ?? 0)) / 60, 2);
        $delayMinutes = (int) ($timeline['summary']['delay_minutes'] ?? 0);
        $isWithinDeadline = (bool) ($timeline['summary']['is_within_deadline'] ?? true);

        if (!$isWithinDeadline) {
            $warnings[] = "Piegade nokave terminu par {$delayMinutes} minutem.";
        }

        $isValid = $hasEnoughVehicles
            && $chainValid
            && $fuelSelectionsLogical
            && (!$needsRefuel || ($fuelStopsCount > 0 && $rangePlanValid))
            && $isWithinDeadline;

        $hints = [
            'critical' => [],
            'optimization' => [],
            'info' => [],
        ];

        if (!$hasEnoughVehicles) {
            $hints['critical'][] = 'Izveleto transportu skaits nav pietiekams visai kravai.';
        }

        if (!$chainValid) {
            $hints['critical'][] = 'Marsruta segmenti neveido nepartrauktu kedi.';
        }

        if (!$resourceCompatibilityValid) {
            $hints['optimization'][] = 'Ostas un kuga kombinacija samazina risinajuma kvalitati un rada saderibas sodu.';
        }

        if ($enforceHandlingCompatibility && !($handlingValidation['valid'] ?? false)) {
            foreach ($handlingValidation['errors'] ?? [] as $reason) {
                $hints['optimization'][] = $reason;
            }
        }

        if ($needsRefuel && $fuelStopsCount === 0) {
            $hints['critical'][] = 'Marsrutam nepieciesama uzpilde, bet nav izveleta neviena degvielas pietura.';
        }

        if (!$rangePlanValid) {
            $hints['critical'][] = 'Transporta darbibas radiuss tiek parsniegts starp uzpildem.';
        }

        if ($assumesDepotRefuel) {
            $hints['info'][] = "Kopejais {$totalDrivenDistanceKm} km nobraukums neietilpst viena baka. Simulacija pienem {$estimatedRefuelEvents} uzpildes starp reisiem, jo marsruta viens virziens ietilpst transporta radiusa.";
        }

        if ($fuelNeededLiters > 0 && $fuelPriceSource === 'default') {
            $hints['info'][] = "Degvielas izmaksas aprekinatas ar noklusejuma cenu {$fuelPricePerLiter} EUR/L, jo izveletajai pieturai nav noradita cena.";
        }

        foreach ($selectedFuelPlan['issues'] as $issue) {
            $hints['critical'][] = $issue;
        }

        if (!$isWithinDeadline) {
            $hints['critical'][] = "Risinajums nokave terminu par {$delayMinutes} minutem.";
        }

        if ($requiredTrips > 1) {
            $hints['optimization'][] = "Risinajumam nepieciesami {$requiredTrips} reisi. Apsver lielaku kapacitati vai vairak transporta vienibu.";
        }

        if (!empty($timeline['events'])) {
            $hints['info'][] = 'Timeline ir aprekinats no secigas notikumu kedes, ieskaitot apstrades un gaidisanas laikus.';
        }

        $score = 100;
        $scoreBreakdown = [
            'base_score' => 100,
            'penalties' => [],
            'final_score' => 100,
        ];

        if (!$isWithinDeadline) {
            $penalty = min($timeWeight, (int) ceil($delayMinutes / 60) * 3);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'deadline_delay',
                'label' => 'Kavejums pret deadline',
                'category' => 'time',
                'amount' => $penalty,
                'details' => "Kavejums: {$delayMinutes} min",
            ];
        }

        if (!$hasEnoughVehicles) {
            $penalty = min($costWeight, 20);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'insufficient_vehicles',
                'label' => 'Nepietiek transporta vienibu',
                'category' => 'cost',
                'amount' => $penalty,
                'details' => "Nepieciesami: {$requiredVehicles}, izveleti: {$vehicleCount}",
            ];
        }

        if (!$chainValid) {
            $penalty = min($compatibilityWeight, 15);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'route_chain',
                'label' => 'Marsruta kede nav nepartraukta',
                'category' => 'compatibility',
                'amount' => $penalty,
                'details' => 'Segmenti neveido korektu secibu',
            ];
        }

        if (!$resourceCompatibilityValid) {
            $penalty = min($compatibilityWeight, 20);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'port_ship_compatibility',
                'label' => 'Ostas un kuga nesaderiba',
                'category' => 'compatibility',
                'amount' => $penalty,
                'details' => 'Osta, kugis vai kapacitate nav savstarpeji korekta',
            ];
        }

        if ($enforceHandlingCompatibility && !($handlingValidation['valid'] ?? false)) {
            $penalty = min($compatibilityWeight, 15);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'handling_selection',
                'label' => 'Kravas apstrades nesaderiba',
                'category' => 'compatibility',
                'amount' => $penalty,
                'details' => implode(' ', $handlingValidation['errors'] ?? []),
            ];
        }

        if ($needsRefuel && $fuelStopsCount === 0) {
            $penalty = min($compatibilityWeight, 10);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'missing_fuel_stop',
                'label' => 'Trukst degvielas pieturas',
                'category' => 'compatibility',
                'amount' => $penalty,
                'details' => 'Marsrutam vajadziga uzpilde, bet nav izveleta neviena pietura',
            ];
        }

        if (!$rangePlanValid) {
            $penalty = min($compatibilityWeight, 10);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'range_plan_invalid',
                'label' => 'Parak lieli attalumi starp uzpildem',
                'category' => 'compatibility',
                'amount' => $penalty,
                'details' => 'Transporta darbibas radiuss tiek parsniegts',
            ];
        }

        if ($requiredTrips > 1) {
            $penalty = min($tripsWeight, ($requiredTrips - 1) * 2);
            $score -= $penalty;

            $scoreBreakdown['penalties'][] = [
                'key' => 'too_many_trips',
                'label' => 'Parak daudz reisu',
                'category' => 'trips',
                'amount' => $penalty,
                'details' => "Nepieciesami {$requiredTrips} reisi",
            ];
        }

        $score = max(0, $score);
        $scoreBreakdown['final_score'] = $score;

        $isExamMode = ($template->evaluation_mode ?? 'practice') === 'exam';

        if ($isExamMode) {
            $warnings = [];
            $hints = [
                'critical' => [],
                'optimization' => [],
                'info' => [],
            ];
        }

        return [
            'transport' => [
                'id' => $transport?->id,
                'name' => $transport?->name ?? '---',
            ],
            'route' => [
                'segments_count' => $segments->count(),
                'distance_km' => $totalDistanceKm,
                'total_driven_distance_km' => $totalDrivenDistanceKm,
                'outbound_distance_km' => round($outboundDistanceKm * $vehicleCount, 2),
                'return_distance_km' => round($returnDistanceKm * $vehicleCount, 2),
                'start' => $segments->first()?->fromLocation->name ?? '---',
                'end' => $segments->last()?->toLocation->name ?? '---',
                'segments' => $segments->map(function ($segment) {
                    return [
                        'id' => $segment->id,
                        'from' => $segment->fromLocation->name ?? '---',
                        'to' => $segment->toLocation->name ?? '---',
                        'distance_km' => $segment->distance_km,
                        'position' => $segment->pivot->position ?? null,
                    ];
                })->values(),
            ],
            'fuel' => [
                'stops_count' => $fuelStopsCount,
                'max_range_km' => $maxRangeKm,
                'total_driven_distance_km' => $totalDrivenDistanceKm,
                'estimated_tank_loads' => $estimatedTankLoads,
                'estimated_refuel_events' => $estimatedRefuelEvents,
                'assumes_depot_refuel' => $assumesDepotRefuel,
                'stops' => $fuelStations->map(function ($station) use ($selectedFuelPlan) {
                    $matchedStop = collect($selectedFuelPlan['selected_positions'] ?? [])
                        ->firstWhere('station_id', $station->id);

                    return [
                        'id' => $station->id,
                        'name' => $station->display_name ?? $station->name ?? '---',
                        'location_name' => $station->location_name ?? $station->location?->name ?? null,
                        'position' => $station->pivot->position ?? null,
                        'distance_from_start_km' => $matchedStop['distance_from_start_km'] ?? null,
                        'is_logical' => $matchedStop['is_logical'] ?? false,
                    ];
                })->values(),
                'approx_leg_distance_km' => $approxLegDistance,
            ],
            'port' => [
                'id' => $port?->id,
                'name' => $port?->name ?? '---',
                'depth_m' => $portDepth ?: null,
            ],
            'ship' => [
                'id' => $ship?->id,
                'name' => $ship?->name ?? '---',
                'ship_type' => $ship?->ship_type ?? null,
                'cargo_type' => $ship?->cargo_type ?? null,
                'cargo_mode' => $ship?->cargo_mode ?? null,
                'draft_m' => $shipDraft ?: null,
                'capacity_containers' => $shipCapacityContainers ?: null,
                'capacity_tons' => $ship?->capacity_tons ?: null,
            ],
            'cargo' => [
                'containers' => $containerCount,
                'tons' => $template->cargo_amount_tons,
            ],
            'handling' => [
                'loading' => [
                    'code' => $handlingValidation['loading']['code'] ?? null,
                    'name' => $handlingValidation['loading']['name'] ?? null,
                    'source' => $handlingValidation['loading']['source'] ?? null,
                    'duration_minutes' => $handlingDurations['loading_duration_minutes'] ?? null,
                ],
                'unloading' => [
                    'code' => $handlingValidation['unloading']['code'] ?? null,
                    'name' => $handlingValidation['unloading']['name'] ?? null,
                    'source' => $handlingValidation['unloading']['source'] ?? null,
                    'duration_minutes' => $handlingDurations['unloading_duration_minutes'] ?? null,
                ],
                'validation' => [
                    'valid' => $handlingValidation['valid'] ?? false,
                    'errors' => $handlingValidation['errors'] ?? [],
                    'warnings' => $handlingValidation['warnings'] ?? [],
                ],
            ],
            'timeline' => $timeline,
            'hints' => $hints,
            'result' => [
                'required_vehicles' => $requiredVehicles,
                'selected_vehicles' => $vehicleCount,
                'vehicle_capacity' => $vehicleCapacity,
                'capacity_per_trip' => $capacityPerTrip,
                'required_trips' => $requiredTrips,
                'trip_time_hours' => $totalOperationHours > 0 ? $totalOperationHours : $tripTimeHours,
                'fuel_needed_liters' => $fuelNeededLiters,
                'total_cost' => $totalCost,
                'needs_refuel' => $needsRefuel,
                'is_valid' => $isValid,
                'score' => $score,
                'loading_duration_minutes' => $handlingDurations['loading_duration_minutes'] ?? null,
                'unloading_duration_minutes' => $handlingDurations['unloading_duration_minutes'] ?? null,
                'scoring' => [
                    'time_weight' => $timeWeight,
                    'cost_weight' => $costWeight,
                    'compatibility_weight' => $compatibilityWeight,
                    'trips_weight' => $tripsWeight,
                ],
                'score_breakdown' => $scoreBreakdown,
                'cost_breakdown' => [
                    'transport_cost' => $transportCost,
                    'fuel_cost' => $fuelCost,
                    'fuel_price_per_liter' => $fuelPricePerLiter,
                    'fuel_price_source' => $fuelPriceSource,
                    'operations_cost' => $operationsCost,
                    'day_operations_cost' => round((float) data_get($timeline, 'costs.day_operations_eur', 0), 2),
                    'night_operations_cost' => round((float) data_get($timeline, 'costs.night_operations_eur', 0), 2),
                ],
                'warnings' => $warnings,
                'delay_minutes' => $delayMinutes,
                'is_within_deadline' => $isWithinDeadline,
            ],
        ];
    }

    private function resolveFuelPricePerLiter(
        array $selectedFuelPlan,
        $fuelStations,
        array $mappedFuelStops,
        float $defaultFuelPricePerLiter
    ): array
    {
        $logicalStationPrices = collect($selectedFuelPlan['selected_positions'] ?? [])
            ->filter(fn (array $position) => (bool) ($position['is_logical'] ?? false))
            ->map(fn (array $position) => (float) data_get($position, 'station.price_per_liter', 0))
            ->filter(fn (float $price) => $price > 0)
            ->values();

        if ($logicalStationPrices->isNotEmpty()) {
            return [
                'price' => round((float) $logicalStationPrices->avg(), 2),
                'source' => 'selected_station',
            ];
        }

        $selectedStationPrices = $fuelStations
            ->map(fn ($station) => (float) ($station->price_per_liter ?? 0))
            ->filter(fn (float $price) => $price > 0)
            ->values();

        if ($selectedStationPrices->isNotEmpty()) {
            return [
                'price' => round((float) $selectedStationPrices->avg(), 2),
                'source' => 'selected_station',
            ];
        }

        $routeStationPrices = collect($mappedFuelStops)
            ->map(fn (array $stop) => (float) data_get($stop, 'station.price_per_liter', 0))
            ->filter(fn (float $price) => $price > 0)
            ->values();

        if ($routeStationPrices->isNotEmpty()) {
            return [
                'price' => round((float) $routeStationPrices->avg(), 2),
                'source' => 'route_station',
            ];
        }

        return [
            'price' => round(max(0.0, $defaultFuelPricePerLiter), 2),
            'source' => 'default',
        ];
    }
}
