<?php

namespace App\Services\Places\Providers;

use App\Services\Places\Contracts\PlaceSearchProviderInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class NominatimPlaceSearchProvider implements PlaceSearchProviderInterface
{
    public function search(string $query, array $options = []): array
    {
        $term = trim($query);

        if (mb_strlen($term) < 3) {
            return [];
        }

        $cacheKey = 'places:nominatim:'.sha1($term.serialize($options));

        if (config('places.place_search_cache_enabled')) {
            return Cache::remember($cacheKey, now()->addDay(), fn () => $this->request($term, $options));
        }

        return $this->request($term, $options);
    }

    private function request(string $query, array $options): array
    {
        $params = [
            'q' => $query,
            'format' => 'jsonv2',
            'addressdetails' => 1,
            'limit' => (int) ($options['limit'] ?? 8),
        ];

        $country = $options['country'] ?? config('places.default_country_filter');

        if ($country) {
            $params['countrycodes'] = strtolower((string) $country);
        }

        $response = Http::withHeaders([
            'User-Agent' => config('app.name', 'LoadMaster').' route builder (server-side place search)',
        ])
            ->timeout(10)
            ->get(rtrim((string) config('places.nominatim_base_url'), '/').'/search', $params);

        if (! $response->ok()) {
            return [];
        }

        return collect($response->json())
            ->filter(fn ($item) => is_array($item))
            ->map(fn (array $item) => $this->normalize($item))
            ->filter()
            ->values()
            ->all();
    }

    private function normalize(array $item): ?array
    {
        $address = is_array($item['address'] ?? null) ? $item['address'] : [];
        $lat = isset($item['lat']) ? (float) $item['lat'] : null;
        $lng = isset($item['lon']) ? (float) $item['lon'] : null;

        if ($lat === null || $lng === null) {
            return null;
        }

        $city = $address['city']
            ?? $address['town']
            ?? $address['village']
            ?? $address['municipality']
            ?? null;
        $name = $item['name'] ?? $city ?? Str::before((string) ($item['display_name'] ?? 'Custom point'), ',');

        return [
            'source' => 'nominatim',
            'external_id' => (string) ($item['place_id'] ?? md5((string) ($item['osm_type'] ?? '').($item['osm_id'] ?? ''))),
            'name' => $name,
            'display_name' => $item['display_name'] ?? $name,
            'country' => $address['country'] ?? null,
            'city' => $city,
            'latitude' => $lat,
            'longitude' => $lng,
            'type' => $this->typeFromClass((string) ($item['class'] ?? ''), (string) ($item['type'] ?? '')),
            'is_saved' => false,
        ];
    }

    private function typeFromClass(string $class, string $type): string
    {
        if ($class === 'place' && in_array($type, ['city', 'town', 'village'], true)) {
            return 'city';
        }

        if ($class === 'man_made' || str_contains($type, 'works')) {
            return 'factory';
        }

        return 'custom';
    }
}
