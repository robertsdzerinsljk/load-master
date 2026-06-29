<?php

namespace App\Services\Routing\Providers;

use App\Models\Port;
use App\Models\SeaRoute;
use App\Services\Routing\Contracts\SeaRoutingProviderInterface;

class ApproximateSeaRoutingProvider implements SeaRoutingProviderInterface
{
    private const EARTH_RADIUS_KM = 6371.0088;

    private const DEFAULT_SEA_SPEED_KMH = 30.0;

    public function calculate(Port $origin, Port $destination): array
    {
        $originLocation = $origin->location;
        $destinationLocation = $destination->location;

        if (
            ! $originLocation
            || ! $destinationLocation
            || $originLocation->latitude === null
            || $originLocation->longitude === null
            || $destinationLocation->latitude === null
            || $destinationLocation->longitude === null
        ) {
            return [
                'route_type' => 'sea',
                'distance_km' => null,
                'duration_hours' => null,
                'geometry_geojson' => null,
                'provider' => 'approximation',
                'warnings' => [],
                'errors' => ['Both ports must have coordinates for approximate sea routing.'],
            ];
        }

        $distanceKm = $this->haversineKm(
            (float) $originLocation->latitude,
            (float) $originLocation->longitude,
            (float) $destinationLocation->latitude,
            (float) $destinationLocation->longitude,
        );
        $durationHours = $distanceKm / self::DEFAULT_SEA_SPEED_KMH;
        $geometry = [
            'type' => 'LineString',
            'coordinates' => [
                [(float) $originLocation->longitude, (float) $originLocation->latitude],
                [(float) $destinationLocation->longitude, (float) $destinationLocation->latitude],
            ],
        ];

        $route = SeaRoute::query()->firstOrCreate(
            [
                'origin_port_id' => $origin->id,
                'destination_port_id' => $destination->id,
            ],
            [
                'distance_km' => round($distanceKm, 2),
                'distance_nm' => round($distanceKm / 1.852, 2),
                'duration_hours' => round($durationHours, 2),
                'geometry_geojson' => $geometry,
                'provider' => 'approximation',
            ]
        );

        return [
            'route_type' => 'sea',
            'distance_km' => round((float) $route->distance_km, 2),
            'duration_hours' => round((float) $route->duration_hours, 2),
            'geometry_geojson' => $route->geometry_geojson,
            'provider' => $route->provider ?: 'approximation',
            'warnings' => ['Sea distance is an approximate straight-line calculation.'],
            'errors' => [],
        ];
    }

    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return self::EARTH_RADIUS_KM * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
