<?php

namespace App\Services\Simulator;

use App\Models\SimulationAttempt;

class SimulationPreviewService
{
    public function __construct(
        private readonly SimulationTimelineService $timelineService
    ) {
    }

    public function build(SimulationAttempt $attempt): array
    {
        $attempt->loadMissing([
            'orderTemplate',
            'selectedTransportTemplate',
            'selectedPort',
            'selectedShip',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'fuelStations.location',
        ]);

        $template = $attempt->orderTemplate;
        $transport = $attempt->selectedTransportTemplate;
        $port = $attempt->selectedPort;
        $ship = $attempt->selectedShip;

        $segments = $attempt->routeSegments->sortBy('pivot.position')->values();
        $fuelStations = $attempt->fuelStations->sortBy('pivot.position')->values();

        $containerCount = (int) ($template->cargo_amount_containers ?? 0);
        $vehicleCount = max(1, (int) ($attempt->selected_vehicle_count ?? 1));

        $vehicleCapacity = (int) (
            $transport->capacity_containers
            ?? $transport->container_capacity
            ?? 1
        );

        $avgSpeed = (float) (
            $transport->avg_speed_kmh
            ?? $transport->average_speed_kmh
            ?? 70
        );

        $fuelPer100Km = (float) ($transport->fuel_consumption_per_100km ?? 28);
        $costPerKm = (float) ($transport->cost_per_km ?? 1.2);
        $maxRangeKm = (float) ($transport->max_range_km ?? 800);

        $totalDistanceKm = round(
            $segments->sum(fn ($segment) => (float) ($segment->distance_km ?? 0)),
            2
        );

        $requiredVehicles = (int) ceil($containerCount / max(1, $vehicleCapacity));
        $tripTimeHours = $avgSpeed > 0 ? round($totalDistanceKm / $avgSpeed, 2) : 0.0;
        $fuelNeededLitersPerVehicle = round(($totalDistanceKm / 100) * $fuelPer100Km, 2);
        $fuelNeededLiters = round($fuelNeededLitersPerVehicle * $vehicleCount, 2);
        $totalCost = round(($totalDistanceKm * $costPerKm) * $vehicleCount, 2);

        $hasEnoughVehicles = $vehicleCount >= $requiredVehicles;
        $chainValid = true;
        $warnings = [];

        if ($segments->count() === 0) {
            $chainValid = false;
            $warnings[] = 'Nav izvēlēts neviens maršruta segments.';
        }

        for ($i = 0; $i < $segments->count() - 1; $i++) {
            $currentTo = $segments[$i]->toLocation->name ?? null;
            $nextFrom = $segments[$i + 1]->fromLocation->name ?? null;

            if ($currentTo !== $nextFrom) {
                $chainValid = false;
                $warnings[] = 'Maršruta segmenti neveido nepārtrauktu ķēdi.';
                break;
            }
        }

        $fuelStopsCount = $fuelStations->count();
        $legsCount = max(1, $fuelStopsCount + 1);
        $approxLegDistance = $legsCount > 0
            ? round($totalDistanceKm / $legsCount, 2)
            : $totalDistanceKm;

        $needsRefuel = $totalDistanceKm > $maxRangeKm;
        $rangePlanValid = $approxLegDistance <= $maxRangeKm;

        if (!$hasEnoughVehicles) {
            $warnings[] = 'Izvēlēto transportu skaits nav pietiekams visai kravai.';
        }

        if ($needsRefuel && $fuelStopsCount === 0) {
            $warnings[] = 'Maršruta attālums pārsniedz transporta darbības rādiusu, bet nav izvēlēta neviena degvielas pietura.';
        }

        if (!$rangePlanValid) {
            $warnings[] = 'Pat ar izvēlēto degvielas pieturu skaitu maršruts ir pārāk garš starp uzpildēm.';
        }

        $portDepth = (float) (
            $port->depth_value
            ?? $port->depth_m
            ?? $port->max_depth_m
            ?? $port->draft_limit_m
            ?? 0
        );

        $shipDraft = (float) (
            $ship->draft_value
            ?? $ship->draft_m
            ?? $ship->draught_m
            ?? $ship->required_depth_m
            ?? 0
        );

        $shipCapacityContainers = (int) (
            $ship->capacity_containers_value
            ?? $ship->capacity_containers
            ?? $ship->container_capacity
            ?? 0
        );

        $portShipCompatible = true;

        if (!$port) {
            $warnings[] = 'Nav izvēlēta osta.';
            $portShipCompatible = false;
        }

        if (!$ship) {
            $warnings[] = 'Nav izvēlēts kuģis.';
            $portShipCompatible = false;
        }

        if ($port && $ship && $shipDraft > $portDepth) {
            $warnings[] = 'Izvēlētais kuģis neder ostai iegrimuma ierobežojuma dēļ.';
            $portShipCompatible = false;
        }

        if ($ship && $containerCount > 0 && $shipCapacityContainers > 0 && $containerCount > $shipCapacityContainers) {
            $warnings[] = 'Izvēlētā kuģa ietilpība nav pietiekama visai kravai.';
            $portShipCompatible = false;
        }

        $timeline = $this->timelineService->build($attempt);
        $delayMinutes = (int) ($timeline['summary']['delay_minutes'] ?? 0);
        $isWithinDeadline = (bool) ($timeline['summary']['is_within_deadline'] ?? true);

        if (!$isWithinDeadline) {
            $warnings[] = "Piegāde nokavē termiņu par {$delayMinutes} minūtēm.";
        }

        $isValid = $hasEnoughVehicles
            && $chainValid
            && (!$needsRefuel || ($fuelStopsCount > 0 && $rangePlanValid))
            && $portShipCompatible
            && $isWithinDeadline;

        $score = 100;

        if (!$hasEnoughVehicles) {
            $score -= 40;
        }

        if (!$chainValid) {
            $score -= 30;
        }

        if ($needsRefuel && $fuelStopsCount === 0) {
            $score -= 20;
        }

        if (!$rangePlanValid) {
            $score -= 15;
        }

        if (!$portShipCompatible) {
            $score -= 25;
        }

        if (!$isWithinDeadline) {
            $score -= min(30, (int) ceil($delayMinutes / 60) * 3);
        }

        $score = max(0, $score);

        return [
            'transport' => [
                'id' => $transport?->id,
                'name' => $transport?->name ?? '—',
            ],
            'route' => [
                'segments_count' => $segments->count(),
                'distance_km' => $totalDistanceKm,
                'start' => $segments->first()?->fromLocation->name ?? '—',
                'end' => $segments->last()?->toLocation->name ?? '—',
                'segments' => $segments->map(function ($segment) {
                    return [
                        'id' => $segment->id,
                        'from' => $segment->fromLocation->name ?? '—',
                        'to' => $segment->toLocation->name ?? '—',
                        'distance_km' => $segment->distance_km,
                        'position' => $segment->pivot->position ?? null,
                    ];
                })->values(),
            ],
            'fuel' => [
                'stops_count' => $fuelStopsCount,
                'stops' => $fuelStations->map(function ($station) {
                    return [
                        'id' => $station->id,
                        'name' => $station->display_name ?? $station->name ?? '—',
                        'location_name' => $station->location_name ?? $station->location?->name ?? null,
                        'position' => $station->pivot->position ?? null,
                    ];
                })->values(),
                'approx_leg_distance_km' => $approxLegDistance,
            ],
            'port' => [
                'id' => $port?->id,
                'name' => $port?->name ?? '—',
                'depth_m' => $portDepth ?: null,
            ],
            'ship' => [
                'id' => $ship?->id,
                'name' => $ship?->name ?? '—',
                'ship_type' => $ship?->ship_type ?? null,
                'draft_m' => $shipDraft ?: null,
                'capacity_containers' => $shipCapacityContainers ?: null,
            ],
            'cargo' => [
                'containers' => $containerCount,
            ],
            'timeline' => $timeline,
            'result' => [
                'required_vehicles' => $requiredVehicles,
                'selected_vehicles' => $vehicleCount,
                'trip_time_hours' => $tripTimeHours,
                'fuel_needed_liters' => $fuelNeededLiters,
                'total_cost' => $totalCost,
                'needs_refuel' => $needsRefuel,
                'is_valid' => $isValid,
                'score' => $score,
                'warnings' => $warnings,
                'delay_minutes' => $delayMinutes,
                'is_within_deadline' => $isWithinDeadline,
            ],
        ];
    }
}