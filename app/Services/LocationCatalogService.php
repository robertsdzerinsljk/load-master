<?php

namespace App\Services;

use App\Models\City;
use App\Models\Location;

class LocationCatalogService
{
    public const ROUTABLE_LOCATION_TYPES = [
        'city',
        'factory',
        'warehouse',
        'port_terminal',
        'customer',
    ];

    public const PORT_LINKABLE_LOCATION_TYPES = [
        'city',
        'port_terminal',
    ];

    public const FUEL_STATION_LOCATION_TYPES = [
        'fuel_station',
    ];

    public function cityOptions(): array
    {
        return City::query()
            ->orderBy('country')
            ->orderBy('name')
            ->get(['id', 'name', 'country'])
            ->all();
    }

    public function countryOptions(): array
    {
        return collect(
            City::query()
                ->whereNotNull('country')
                ->pluck('country')
                ->merge(
                    Location::query()
                        ->whereNotNull('country')
                        ->pluck('country')
                )
        )
            ->map(fn ($country) => trim((string) $country))
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    public function locationOptions(?array $types = null, array $includeIds = []): array
    {
        $includeIds = array_values(array_filter(
            $includeIds,
            fn ($id) => is_numeric($id)
        ));

        $query = Location::query()
            ->orderBy('country')
            ->orderBy('city')
            ->orderBy('name');

        if ($types && count($types) > 0) {
            $query->where(function ($builder) use ($types, $includeIds) {
                $builder->whereIn('type', $types);
                $builder->orWhereNull('type');

                if (count($includeIds) > 0) {
                    $builder->orWhereIn('id', $includeIds);
                }
            });
        }

        return $query->get([
            'id',
            'name',
            'type',
            'country',
            'city',
            'city_id',
            'address',
            'latitude',
            'longitude',
            'notes',
        ])->all();
    }

    public function createOrUpdateLocation(
        ?Location $location,
        array $attributes,
        ?string $forcedType = null,
    ): Location {
        $payload = $this->buildLocationPayload($attributes, $forcedType);

        if ($location) {
            $location->update($payload);

            return $location->fresh();
        }

        return Location::query()->create($payload);
    }

    public function buildLocationPayload(array $attributes, ?string $forcedType = null): array
    {
        $city = $this->resolveCity(
            $attributes['city_id'] ?? null,
            $attributes['new_city_name'] ?? null,
            $attributes['country'] ?? null,
        );

        $country = trim((string) ($attributes['country'] ?? ''));

        if ($country === '' && $city?->country) {
            $country = $city->country;
        }

        return [
            'name' => $attributes['name'],
            'type' => $forcedType ?? ($attributes['type'] ?? null),
            'country' => $country !== '' ? $country : null,
            'city_id' => $city?->id,
            'city' => $city?->name,
            'address' => $attributes['address'] ?? null,
            'latitude' => $attributes['latitude'] ?? null,
            'longitude' => $attributes['longitude'] ?? null,
            'notes' => $attributes['notes'] ?? null,
        ];
    }

    private function resolveCity(?int $cityId, ?string $newCityName, ?string $country): ?City
    {
        $trimmedName = trim((string) $newCityName);

        if ($trimmedName !== '') {
            $trimmedCountry = trim((string) ($country ?? ''));
            $normalizedCountry = $trimmedCountry !== '' ? $trimmedCountry : null;

            return City::query()->firstOrCreate([
                'name' => $trimmedName,
                'country' => $normalizedCountry,
            ]);
        }

        if (!$cityId) {
            return null;
        }

        return City::query()->find($cityId);
    }
}
