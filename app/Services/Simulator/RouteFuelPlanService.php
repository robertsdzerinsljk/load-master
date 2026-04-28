<?php

namespace App\Services\Simulator;

class RouteFuelPlanService
{
    public function mapRouteFuelStops($segments): array
    {
        $mappedStops = [];
        $distanceOffset = 0.0;

        foreach ($segments as $segment) {
            $segmentFuelStops = $segment->fuelStops
                ->sortBy('distance_from_start_km')
                ->values();

            foreach ($segmentFuelStops as $routeFuelStop) {
                $mappedStops[] = [
                    'station_id' => $routeFuelStop->fuel_station_id,
                    'distance_from_start_km' => round(
                        $distanceOffset + (float) ($routeFuelStop->distance_from_start_km ?? 0),
                        2
                    ),
                    'distance_from_segment_start_km' => round((float) ($routeFuelStop->distance_from_start_km ?? 0), 2),
                    'segment_id' => $segment->id,
                    'station' => $routeFuelStop->fuelStation,
                ];
            }

            $distanceOffset += (float) ($segment->distance_km ?? 0);
        }

        usort(
            $mappedStops,
            fn (array $left, array $right) => $left['distance_from_start_km'] <=> $right['distance_from_start_km']
        );

        return $mappedStops;
    }

    public function resolveSelectedFuelPlan($fuelStations, array $mappedFuelStops, float $totalDistanceKm, float $maxRangeKm): array
    {
        $selectedPositions = [];
        $issues = [];
        $lastDistance = 0.0;
        $matchedIndexes = [];

        foreach ($fuelStations as $station) {
            $matchedStop = null;
            $matchedIndex = null;

            foreach ($mappedFuelStops as $index => $mappedStop) {
                if (in_array($index, $matchedIndexes, true)) {
                    continue;
                }

                if (($mappedStop['station_id'] ?? null) !== $station->id) {
                    continue;
                }

                if (($mappedStop['distance_from_start_km'] ?? 0) < $lastDistance) {
                    continue;
                }

                $matchedStop = $mappedStop;
                $matchedIndex = $index;
                break;
            }

            if ($matchedStop === null) {
                $issues[] = sprintf(
                    'Degvielas pietura "%s" neatrodas uz izveidota marsruta vai ir izveleta nelojiska seciba.',
                    $station->display_name ?? $station->name ?? 'Degvielas pietura'
                );

                $selectedPositions[] = [
                    'station_id' => $station->id,
                    'distance_from_start_km' => null,
                    'distance_from_segment_start_km' => null,
                    'segment_id' => null,
                    'is_logical' => false,
                    'station' => $station,
                ];

                continue;
            }

            $matchedIndexes[] = $matchedIndex;
            $lastDistance = (float) $matchedStop['distance_from_start_km'];

            $selectedPositions[] = [
                'station_id' => $station->id,
                'distance_from_start_km' => $lastDistance,
                'distance_from_segment_start_km' => $matchedStop['distance_from_segment_start_km'] ?? null,
                'segment_id' => $matchedStop['segment_id'] ?? null,
                'is_logical' => true,
                'station' => $station,
            ];
        }

        $legBoundaries = [0.0];

        foreach ($selectedPositions as $position) {
            if (($position['is_logical'] ?? false) && $position['distance_from_start_km'] !== null) {
                $legBoundaries[] = (float) $position['distance_from_start_km'];
            }
        }

        $legBoundaries[] = max(0.0, $totalDistanceKm);

        $legDistances = [];

        for ($i = 1; $i < count($legBoundaries); $i++) {
            $legDistances[] = round(max(0, $legBoundaries[$i] - $legBoundaries[$i - 1]), 2);
        }

        $approxLegDistance = !empty($legDistances)
            ? max($legDistances)
            : round(max(0.0, $totalDistanceKm), 2);

        $rangePlanValid = empty($issues);

        if ($maxRangeKm > 0) {
            foreach ($legDistances as $legDistance) {
                if ($legDistance > $maxRangeKm) {
                    $rangePlanValid = false;
                    break;
                }
            }
        }

        return [
            'logical' => empty($issues),
            'issues' => array_values(array_unique($issues)),
            'selected_positions' => $selectedPositions,
            'approx_leg_distance_km' => round($approxLegDistance, 2),
            'range_plan_valid' => $rangePlanValid,
        ];
    }
}
