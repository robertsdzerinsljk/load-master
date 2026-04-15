<?php

namespace App\Services;

use App\Models\LandRoute;
use App\Models\TransportTemplate;

class LandTransportCalculator
{
    public function calculate(
        LandRoute $route,
        TransportTemplate $transport,
        int $cargoAmountContainers
    ): array {
        $vehicleCapacity = (int) ($transport->capacity_containers ?? 0);
        $distanceKm = (float) ($route->distance_km ?? 0);
        $avgSpeedKmh = (float) ($transport->avg_speed_kmh ?? 0);
        $costPerKm = (float) ($transport->cost_per_km ?? 0);
        $fuelConsumptionPer100km = (float) ($transport->fuel_consumption_per_100km ?? 0);
        $maxRangeKm = (float) ($transport->max_range_km ?? 0);
        $loadingTimeMinutes = (int) ($transport->loading_time_minutes ?? 0);
        $unloadingTimeMinutes = (int) ($transport->unloading_time_minutes ?? 0);
        $routeTollCost = (float) ($route->toll_cost ?? 0);

        $requiredVehicles = $vehicleCapacity > 0
            ? (int) ceil($cargoAmountContainers / $vehicleCapacity)
            : 0;

        $tripTimeHours = $avgSpeedKmh > 0
            ? $distanceKm / $avgSpeedKmh
            : 0;

        $cycleTimeHours = $tripTimeHours
            + ($loadingTimeMinutes / 60)
            + ($unloadingTimeMinutes / 60);

        $transportCostPerVehicle = $distanceKm * $costPerKm;
        $tollCostPerVehicle = $routeTollCost;
        $baseCostPerVehicle = $transportCostPerVehicle + $tollCostPerVehicle;
        $totalBaseCost = $requiredVehicles * $baseCostPerVehicle;

        $fuelUsedLitersPerVehicle = ($distanceKm / 100) * $fuelConsumptionPer100km;

        $needsRefuel = $maxRangeKm > 0
            ? $distanceKm > $maxRangeKm
            : false;

        $fuelStopsOnRoute = $route->fuelStops()
            ->with('fuelStation.location')
            ->orderBy('distance_from_start_km')
            ->get();

        $reachableFuelStops = [];
        if ($needsRefuel && $maxRangeKm > 0) {
            foreach ($fuelStopsOnRoute as $stop) {
                if ((float) $stop->distance_from_start_km <= $maxRangeKm) {
                    $reachableFuelStops[] = [
                        'distance_from_start_km' => round((float) $stop->distance_from_start_km, 2),
                        'station_name' => $stop->fuelStation?->location?->name,
                        'station_city' => $stop->fuelStation?->location?->city,
                        'fuel_type' => $stop->fuelStation?->fuel_type,
                        'price_per_liter' => $stop->fuelStation?->price_per_liter !== null
                            ? round((float) $stop->fuelStation->price_per_liter, 2)
                            : null,
                    ];
                }
            }
        }

        $recommendedFuelStop = $reachableFuelStops[0] ?? null;

        $fuelCostPerVehicle = null;
        $totalFuelCost = null;

        if ($recommendedFuelStop && $recommendedFuelStop['price_per_liter'] !== null) {
            $fuelCostPerVehicle = $fuelUsedLitersPerVehicle * (float) $recommendedFuelStop['price_per_liter'];
            $totalFuelCost = $requiredVehicles * $fuelCostPerVehicle;
        }

        $totalCost = $totalBaseCost + ($totalFuelCost ?? 0);

        return [
            'route' => [
                'from' => $route->fromLocation?->name,
                'to' => $route->toLocation?->name,
                'distance_km' => round($distanceKm, 2),
                'toll_cost' => round($routeTollCost, 2),
            ],
            'transport' => [
                'name' => $transport->name,
                'type' => $transport->type,
                'capacity_containers' => $vehicleCapacity,
                'avg_speed_kmh' => round($avgSpeedKmh, 2),
                'cost_per_km' => round($costPerKm, 2),
                'fuel_consumption_per_100km' => round($fuelConsumptionPer100km, 2),
                'max_range_km' => round($maxRangeKm, 2),
                'loading_time_minutes' => $loadingTimeMinutes,
                'unloading_time_minutes' => $unloadingTimeMinutes,
            ],
            'cargo' => [
                'amount_containers' => $cargoAmountContainers,
            ],
            'result' => [
                'required_vehicles' => $requiredVehicles,
                'trip_time_hours' => round($tripTimeHours, 2),
                'cycle_time_hours' => round($cycleTimeHours, 2),
                'transport_cost_per_vehicle' => round($transportCostPerVehicle, 2),
                'base_cost_per_vehicle' => round($baseCostPerVehicle, 2),
                'total_base_cost' => round($totalBaseCost, 2),
                'fuel_used_liters_per_vehicle' => round($fuelUsedLitersPerVehicle, 2),
                'needs_refuel' => $needsRefuel,
                'can_complete_with_current_route_data' => !$needsRefuel || !empty($reachableFuelStops),
                'fuel_cost_per_vehicle' => $fuelCostPerVehicle !== null ? round($fuelCostPerVehicle, 2) : null,
                'total_fuel_cost' => $totalFuelCost !== null ? round($totalFuelCost, 2) : null,
                'total_cost' => round($totalCost, 2),
            ],
            'fuel' => [
                'available_fuel_stops' => $fuelStopsOnRoute->map(function ($stop) {
                    return [
                        'distance_from_start_km' => round((float) $stop->distance_from_start_km, 2),
                        'station_name' => $stop->fuelStation?->location?->name,
                        'station_city' => $stop->fuelStation?->location?->city,
                        'fuel_type' => $stop->fuelStation?->fuel_type,
                        'price_per_liter' => $stop->fuelStation?->price_per_liter !== null
                            ? round((float) $stop->fuelStation->price_per_liter, 2)
                            : null,
                    ];
                })->values()->all(),
                'reachable_fuel_stops' => $reachableFuelStops,
                'recommended_fuel_stop' => $recommendedFuelStop,
            ],
        ];
    }
}