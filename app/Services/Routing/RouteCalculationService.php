<?php

namespace App\Services\Routing;

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\Port;
use App\Services\Routing\Contracts\LandRoutingProviderInterface;
use App\Services\Routing\Contracts\SeaRoutingProviderInterface;
use App\Services\Routing\Providers\ApproximateSeaRoutingProvider;
use App\Services\Routing\Providers\ManualSeaRoutingProvider;
use App\Services\Routing\Providers\OsrmLandRoutingProvider;

class RouteCalculationService
{
    public function land(Location $origin, Location $destination): array
    {
        $cachedRoute = LandRoute::query()
            ->where('from_location_id', $origin->id)
            ->where('to_location_id', $destination->id)
            ->first();

        if ($cachedRoute && config('routing.route_cache_enabled')) {
            return $this->landRouteResponse($cachedRoute);
        }

        $result = $this->landProvider()->calculate($origin, $destination);

        if (($result['errors'] ?? []) === []) {
            $route = LandRoute::query()->updateOrCreate(
                [
                    'from_location_id' => $origin->id,
                    'to_location_id' => $destination->id,
                ],
                [
                    'distance_km' => $result['distance_km'],
                    'estimated_time_hours' => $result['duration_hours'],
                    'geometry_geojson' => $result['geometry_geojson'],
                    'provider' => $result['provider'],
                    'toll_cost' => $cachedRoute?->toll_cost,
                    'notes' => $cachedRoute?->notes,
                ]
            );

            return $this->landRouteResponse($route, $result['warnings'] ?? []);
        }

        return $result;
    }

    public function sea(Port $origin, Port $destination): array
    {
        $manual = app(ManualSeaRoutingProvider::class)->calculate($origin, $destination);

        if (($manual['errors'] ?? []) === []) {
            return $manual;
        }

        return $this->seaProvider()->calculate($origin, $destination);
    }

    public function multimodal(array $legs): array
    {
        $normalizedLegs = [];
        $warnings = [];
        $errors = [];
        $totalDistance = 0.0;
        $totalDuration = 0.0;
        $totalCost = 0.0;

        foreach ($legs as $leg) {
            $type = $leg['type'] ?? null;

            if ($type === 'land') {
                $result = $this->land(
                    Location::query()->findOrFail($leg['origin_location_id']),
                    Location::query()->findOrFail($leg['destination_location_id']),
                );
            } elseif ($type === 'sea') {
                $result = $this->sea(
                    Port::query()->with('location')->findOrFail($leg['origin_port_id']),
                    Port::query()->with('location')->findOrFail($leg['destination_port_id']),
                );
            } elseif ($type === 'port_handling') {
                $result = [
                    'route_type' => 'port_handling',
                    'distance_km' => 0,
                    'duration_hours' => (float) ($leg['duration_hours'] ?? 0),
                    'cost' => (float) ($leg['cost'] ?? 0),
                    'provider' => 'manual',
                    'warnings' => [],
                    'errors' => [],
                ];
            } else {
                $result = [
                    'route_type' => (string) $type,
                    'warnings' => [],
                    'errors' => ['Unsupported route leg type.'],
                ];
            }

            $warnings = [...$warnings, ...($result['warnings'] ?? [])];
            $errors = [...$errors, ...($result['errors'] ?? [])];
            $totalDistance += (float) ($result['distance_km'] ?? 0);
            $totalDuration += (float) ($result['duration_hours'] ?? 0);
            $totalCost += (float) ($result['cost'] ?? 0);
            $normalizedLegs[] = $this->normalizeLeg($leg, $result);
        }

        return [
            'route_type' => 'multimodal',
            'total_distance_km' => round($totalDistance, 2),
            'total_duration_hours' => round($totalDuration, 2),
            'total_cost' => round($totalCost, 2),
            'legs' => $normalizedLegs,
            'warnings' => array_values(array_unique($warnings)),
            'errors' => $errors,
        ];
    }

    private function landProvider(): LandRoutingProviderInterface
    {
        return match (config('routing.land_routing_provider')) {
            'osrm' => app(OsrmLandRoutingProvider::class),
            default => app(OsrmLandRoutingProvider::class),
        };
    }

    private function seaProvider(): SeaRoutingProviderInterface
    {
        return match (config('routing.sea_routing_provider')) {
            'approximation' => app(ApproximateSeaRoutingProvider::class),
            'manual' => app(ApproximateSeaRoutingProvider::class),
            default => app(ApproximateSeaRoutingProvider::class),
        };
    }

    private function landRouteResponse(LandRoute $route, array $warnings = []): array
    {
        return [
            'route_type' => 'land',
            'distance_km' => round((float) $route->distance_km, 2),
            'duration_hours' => $route->estimated_time_hours !== null
                ? round((float) $route->estimated_time_hours, 2)
                : null,
            'geometry_geojson' => $route->geometry_geojson,
            'provider' => $route->provider ?: 'manual',
            'warnings' => $warnings,
            'errors' => [],
        ];
    }

    private function normalizeLeg(array $leg, array $result): array
    {
        return array_filter([
            'type' => $leg['type'] ?? $result['route_type'] ?? null,
            'origin' => $leg['origin'] ?? null,
            'destination' => $leg['destination'] ?? null,
            'port' => $leg['port'] ?? null,
            'distance_km' => $result['distance_km'] ?? null,
            'duration_hours' => $result['duration_hours'] ?? null,
            'cost' => $result['cost'] ?? null,
            'geometry_geojson' => $result['geometry_geojson'] ?? null,
            'provider' => $result['provider'] ?? null,
            'warnings' => $result['warnings'] ?? [],
            'errors' => $result['errors'] ?? [],
        ], fn ($value) => $value !== null);
    }
}
