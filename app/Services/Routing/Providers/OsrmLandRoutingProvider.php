<?php

namespace App\Services\Routing\Providers;

use App\Models\Location;
use App\Services\Routing\Contracts\LandRoutingProviderInterface;
use Illuminate\Support\Facades\Http;
use Throwable;

class OsrmLandRoutingProvider implements LandRoutingProviderInterface
{
    public function calculate(Location $origin, Location $destination): array
    {
        $errors = $this->validateCoordinates($origin, $destination);

        if ($errors !== []) {
            return $this->invalidResponse($errors);
        }

        $baseUrl = (string) config('routing.osrm_base_url');
        $coordinates = sprintf(
            '%s,%s;%s,%s',
            $origin->longitude,
            $origin->latitude,
            $destination->longitude,
            $destination->latitude,
        );

        try {
            $request = Http::timeout(12);

            if (! config('routing.osrm_verify_ssl')) {
                $request = $request->withoutVerifying();
            }

            $response = $request->get("{$baseUrl}/route/v1/driving/{$coordinates}", [
                'overview' => 'full',
                'geometries' => 'geojson',
            ]);
        } catch (Throwable $exception) {
            return $this->fallbackResponse(
                $origin,
                $destination,
                'OSRM route request failed; approximate straight-line distance was used.',
            );
        }

        if (! $response->ok()) {
            return $this->fallbackResponse(
                $origin,
                $destination,
                'OSRM route request failed with status '.$response->status().'; approximate straight-line distance was used.',
            );
        }

        $route = $response->json('routes.0');

        if (! is_array($route)) {
            return $this->fallbackResponse(
                $origin,
                $destination,
                'OSRM did not return a route; approximate straight-line distance was used.',
            );
        }

        return [
            'route_type' => 'land',
            'distance_km' => round(((float) ($route['distance'] ?? 0)) / 1000, 2),
            'duration_hours' => round(((float) ($route['duration'] ?? 0)) / 3600, 2),
            'geometry_geojson' => $route['geometry'] ?? null,
            'provider' => 'osrm',
            'warnings' => [],
            'errors' => [],
        ];
    }

    private function validateCoordinates(Location $origin, Location $destination): array
    {
        $errors = [];

        foreach (['origin' => $origin, 'destination' => $destination] as $label => $location) {
            if ($location->latitude === null || $location->longitude === null) {
                $errors[] = ucfirst($label).' location is missing coordinates.';
            }
        }

        return $errors;
    }

    private function invalidResponse(array $errors): array
    {
        return [
            'route_type' => 'land',
            'distance_km' => null,
            'duration_hours' => null,
            'geometry_geojson' => null,
            'provider' => 'osrm',
            'warnings' => [],
            'errors' => $errors,
        ];
    }

    private function fallbackResponse(Location $origin, Location $destination, string $warning): array
    {
        $distanceKm = $this->haversineDistanceKm(
            (float) $origin->latitude,
            (float) $origin->longitude,
            (float) $destination->latitude,
            (float) $destination->longitude,
        );
        $roadFactor = 1.25;
        $estimatedDistance = round($distanceKm * $roadFactor, 2);

        return [
            'route_type' => 'land',
            'distance_km' => $estimatedDistance,
            'duration_hours' => round($estimatedDistance / 70, 2),
            'geometry_geojson' => [
                'type' => 'LineString',
                'coordinates' => [
                    [(float) $origin->longitude, (float) $origin->latitude],
                    [(float) $destination->longitude, (float) $destination->latitude],
                ],
            ],
            'provider' => 'approximation',
            'warnings' => [$warning],
            'errors' => [],
        ];
    }

    private function haversineDistanceKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadiusKm = 6371;
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lonDelta / 2) ** 2;

        return $earthRadiusKm * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
