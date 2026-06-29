<?php

namespace App\Services\Places\Providers;

use App\Models\Location;
use App\Services\Places\Contracts\PlaceSearchProviderInterface;

class LocalLocationSearchProvider implements PlaceSearchProviderInterface
{
    public function search(string $query, array $options = []): array
    {
        $term = trim($query);

        if (mb_strlen($term) < 2) {
            return [];
        }

        return Location::query()
            ->where(function ($builder) use ($term) {
                $builder
                    ->where('name', 'like', "%{$term}%")
                    ->orWhere('city', 'like', "%{$term}%")
                    ->orWhere('country', 'like', "%{$term}%")
                    ->orWhere('address', 'like', "%{$term}%");
            })
            ->orderBy('country')
            ->orderBy('city')
            ->orderBy('name')
            ->limit((int) ($options['limit'] ?? 10))
            ->get()
            ->map(fn (Location $location) => [
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
            ])
            ->all();
    }
}
