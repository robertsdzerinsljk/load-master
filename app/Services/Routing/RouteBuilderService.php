<?php

namespace App\Services\Routing;

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\Port;
use App\Models\RouteTemplate;
use App\Services\Places\PlaceSearchService;
use Illuminate\Support\Facades\DB;

class RouteBuilderService
{
    public function __construct(
        private readonly RouteCalculationService $routes,
        private readonly PlaceSearchService $places,
    ) {}

    public function preview(array $points): array
    {
        $normalizedPoints = collect($points)
            ->values()
            ->map(fn (array $point, int $index) => $this->normalizePoint($point, $index))
            ->all();

        $legs = [];
        $warnings = [];
        $errors = [];
        $totalDistance = 0.0;
        $totalDuration = 0.0;

        foreach (array_values($normalizedPoints) as $index => $point) {
            $next = $normalizedPoints[$index + 1] ?? null;

            if (! $next) {
                break;
            }

            $leg = $this->calculateLeg($point, $next, $index);
            $legs[] = $leg;
            $warnings = [...$warnings, ...($leg['warnings'] ?? [])];
            $errors = [...$errors, ...($leg['errors'] ?? [])];
            $totalDistance += (float) ($leg['distance_km'] ?? 0);
            $totalDuration += (float) ($leg['duration_hours'] ?? 0);
        }

        return [
            'route_type' => 'multimodal',
            'points' => $normalizedPoints,
            'legs' => $legs,
            'land_route_ids' => collect($legs)->pluck('land_route_id')->filter()->values()->all(),
            'total_distance_km' => round($totalDistance, 2),
            'total_duration_hours' => round($totalDuration, 2),
            'warnings' => array_values(array_unique($warnings)),
            'errors' => $errors,
        ];
    }

    public function saveTemplate(array $payload, int $userId): RouteTemplate
    {
        return DB::transaction(function () use ($payload, $userId) {
            $preview = $this->preview($payload['points']);

            $template = RouteTemplate::query()->create([
                'name' => $payload['name'],
                'description' => $payload['description'] ?? null,
                'created_by' => $userId,
                'mode' => $payload['mode'] ?? 'auto',
                'total_distance_km' => $preview['total_distance_km'],
                'total_duration_hours' => $preview['total_duration_hours'],
                'metadata' => [
                    'land_route_ids' => $preview['land_route_ids'],
                    'warnings' => $preview['warnings'],
                    'errors' => $preview['errors'],
                ],
            ]);

            $pointModels = [];

            foreach ($preview['points'] as $point) {
                $pointModels[$point['sequence']] = $template->points()->create([
                    'sequence' => $point['sequence'],
                    'label' => $point['label'],
                    'location_id' => $point['location_id'],
                    'name' => $point['name'],
                    'latitude' => $point['latitude'],
                    'longitude' => $point['longitude'],
                    'point_type' => $point['type'],
                    'metadata' => $point,
                ]);
            }

            foreach ($preview['legs'] as $leg) {
                $template->legs()->create([
                    'sequence' => $leg['sequence'],
                    'type' => $leg['type'],
                    'origin_point_id' => $pointModels[$leg['sequence']]?->id ?? null,
                    'destination_point_id' => $pointModels[$leg['sequence'] + 1]?->id ?? null,
                    'distance_km' => $leg['distance_km'] ?? null,
                    'duration_hours' => $leg['duration_hours'] ?? null,
                    'cost' => $leg['cost'] ?? null,
                    'provider' => $leg['provider'] ?? null,
                    'geometry_geojson' => $leg['geometry_geojson'] ?? null,
                    'warnings' => $leg['warnings'] ?? [],
                    'errors' => $leg['errors'] ?? [],
                ]);
            }

            return $template->load(['points', 'legs']);
        });
    }

    private function normalizePoint(array $point, int $index): array
    {
        $location = isset($point['location_id'])
            ? Location::query()->find((int) $point['location_id'])
            : null;

        if (! $location) {
            $location = $this->places->savePlace([
                'source' => $point['source'] ?? 'custom',
                'external_id' => $point['external_id'] ?? null,
                'name' => $point['name'] ?? 'Custom point',
                'display_name' => $point['display_name'] ?? null,
                'country' => $point['country'] ?? null,
                'city' => $point['city'] ?? null,
                'latitude' => $point['latitude'],
                'longitude' => $point['longitude'],
                'type' => $point['type'] ?? 'custom',
            ]);
        }

        return [
            'sequence' => $index,
            'label' => chr(65 + $index),
            'location_id' => $location->id,
            'name' => $location->name,
            'display_name' => collect([$location->name, $location->city, $location->country])->filter()->implode(', '),
            'country' => $location->country,
            'city' => $location->city,
            'latitude' => $location->latitude !== null ? (float) $location->latitude : null,
            'longitude' => $location->longitude !== null ? (float) $location->longitude : null,
            'type' => $point['type'] ?? $location->type ?? 'custom',
            'is_saved' => true,
        ];
    }

    private function calculateLeg(array $originPoint, array $destinationPoint, int $index): array
    {
        $originPort = $this->portForPoint($originPoint);
        $destinationPort = $this->portForPoint($destinationPoint);

        if ($originPort && $destinationPort) {
            $result = $this->routes->sea($originPort, $destinationPort);

            return $this->legResponse('sea', $originPoint, $destinationPoint, $index, $result);
        }

        $origin = Location::query()->findOrFail($originPoint['location_id']);
        $destination = Location::query()->findOrFail($destinationPoint['location_id']);
        $result = $this->routes->land($origin, $destination);
        $landRouteId = LandRoute::query()
            ->where('from_location_id', $origin->id)
            ->where('to_location_id', $destination->id)
            ->value('id');

        return [
            ...$this->legResponse('land', $originPoint, $destinationPoint, $index, $result),
            'land_route_id' => $landRouteId,
        ];
    }

    private function legResponse(string $type, array $originPoint, array $destinationPoint, int $index, array $result): array
    {
        return [
            'sequence' => $index,
            'type' => $type,
            'origin' => $originPoint['name'],
            'destination' => $destinationPoint['name'],
            'origin_location_id' => $originPoint['location_id'],
            'destination_location_id' => $destinationPoint['location_id'],
            'distance_km' => $result['distance_km'] ?? null,
            'duration_hours' => $result['duration_hours'] ?? null,
            'cost' => $result['cost'] ?? null,
            'provider' => $result['provider'] ?? null,
            'geometry_geojson' => $result['geometry_geojson'] ?? null,
            'warnings' => $result['warnings'] ?? [],
            'errors' => $result['errors'] ?? [],
        ];
    }

    private function portForPoint(array $point): ?Port
    {
        if (($point['type'] ?? null) !== 'port' && ($point['type'] ?? null) !== 'port_terminal') {
            return null;
        }

        return Port::query()
            ->where('location_id', $point['location_id'])
            ->with('location')
            ->first();
    }
}
