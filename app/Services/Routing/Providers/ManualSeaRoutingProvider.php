<?php

namespace App\Services\Routing\Providers;

use App\Models\Port;
use App\Models\SeaRoute;
use App\Services\Routing\Contracts\SeaRoutingProviderInterface;

class ManualSeaRoutingProvider implements SeaRoutingProviderInterface
{
    public function calculate(Port $origin, Port $destination): array
    {
        $route = SeaRoute::query()
            ->where('origin_port_id', $origin->id)
            ->where('destination_port_id', $destination->id)
            ->first();

        if (! $route) {
            return [
                'route_type' => 'sea',
                'distance_km' => null,
                'duration_hours' => null,
                'geometry_geojson' => null,
                'provider' => 'manual',
                'warnings' => [],
                'errors' => ['No manual sea route exists for the selected ports.'],
            ];
        }

        return [
            'route_type' => 'sea',
            'distance_km' => round((float) $route->distance_km, 2),
            'duration_hours' => $route->duration_hours !== null
                ? round((float) $route->duration_hours, 2)
                : null,
            'geometry_geojson' => $route->geometry_geojson,
            'provider' => $route->provider ?: 'manual',
            'warnings' => [],
            'errors' => [],
        ];
    }
}
