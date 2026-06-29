<?php

namespace App\Services\Places;

use App\Models\Location;
use App\Services\Places\Providers\LocalLocationSearchProvider;
use App\Services\Places\Providers\NominatimPlaceSearchProvider;

class PlaceSearchService
{
    public function search(string $query, array $options = []): array
    {
        $local = app(LocalLocationSearchProvider::class)->search($query, $options);

        if ($local !== [] || ! config('places.enable_external_place_search')) {
            return ['results' => $local];
        }

        $external = match (config('places.place_search_provider')) {
            'nominatim' => app(NominatimPlaceSearchProvider::class)->search($query, $options),
            default => [],
        };

        return ['results' => $external];
    }

    public function savePlace(array $place): Location
    {
        $source = $place['source'] ?? 'custom';
        $externalId = $place['external_id'] ?? null;

        if ($externalId) {
            $existing = Location::query()
                ->where('source', $source)
                ->where('external_id', $externalId)
                ->first();

            if ($existing) {
                return $existing;
            }
        }

        $nearby = $this->findNearbyLocation(
            (float) $place['latitude'],
            (float) $place['longitude'],
            $place['name'] ?? null,
        );

        if ($nearby) {
            if ($source !== 'custom' && ! $nearby->source) {
                $nearby->update([
                    'source' => $source,
                    'external_id' => $externalId,
                ]);
            }

            return $nearby;
        }

        return Location::query()->create([
            'name' => $place['name'],
            'type' => $place['type'] ?? 'custom',
            'country' => $place['country'] ?? null,
            'city' => $place['city'] ?? null,
            'address' => $place['address'] ?? $place['display_name'] ?? null,
            'latitude' => $place['latitude'],
            'longitude' => $place['longitude'],
            'source' => $source,
            'external_id' => $externalId,
            'metadata' => $place['metadata'] ?? null,
        ]);
    }

    public function normalizeLocation(Location $location): array
    {
        return [
            'source' => $location->source ?: 'local',
            'external_id' => $location->external_id,
            'location_id' => $location->id,
            'name' => $location->name,
            'display_name' => collect([$location->name, $location->city, $location->country])
                ->filter()
                ->implode(', '),
            'country' => $location->country,
            'city' => $location->city,
            'latitude' => $location->latitude !== null ? (float) $location->latitude : null,
            'longitude' => $location->longitude !== null ? (float) $location->longitude : null,
            'type' => $location->type ?: 'custom',
            'is_saved' => true,
        ];
    }

    private function findNearbyLocation(float $latitude, float $longitude, ?string $name): ?Location
    {
        return Location::query()
            ->whereBetween('latitude', [$latitude - 0.0005, $latitude + 0.0005])
            ->whereBetween('longitude', [$longitude - 0.0005, $longitude + 0.0005])
            ->when($name, fn ($query) => $query->where('name', $name))
            ->first();
    }
}
