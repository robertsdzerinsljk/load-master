<?php

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\RouteTemplate;
use App\Models\User;
use Illuminate\Support\Facades\Http;

function mapBuilderUser(): User
{
    return User::factory()->create(['role' => 'teacher']);
}

function mapBuilderPoint(string $name, float $latitude, float $longitude, ?int $locationId = null): array
{
    return array_filter([
        'location_id' => $locationId,
        'name' => $name,
        'latitude' => $latitude,
        'longitude' => $longitude,
        'type' => 'city',
    ], fn ($value) => $value !== null);
}

test('local place search returns normalized saved locations first', function () {
    $user = mapBuilderUser();
    Location::query()->create([
        'name' => 'Riga',
        'type' => 'city',
        'country' => 'Latvia',
        'city' => 'Riga',
        'latitude' => 56.9496,
        'longitude' => 24.1052,
    ]);

    $response = $this->actingAs($user)->getJson('/places/search?q=Riga');

    $response->assertOk()
        ->assertJsonPath('results.0.name', 'Riga')
        ->assertJsonPath('results.0.is_saved', true)
        ->assertJsonPath('results.0.type', 'city');
});

test('nominatim place search is normalized through backend when enabled', function () {
    config([
        'places.enable_external_place_search' => true,
        'places.place_search_provider' => 'nominatim',
        'places.nominatim_base_url' => 'https://nominatim.test',
    ]);

    Http::fake([
        'https://nominatim.test/search*' => Http::response([
            [
                'place_id' => 123,
                'name' => 'Riga',
                'display_name' => 'Riga, Latvia',
                'lat' => '56.9496',
                'lon' => '24.1052',
                'class' => 'place',
                'type' => 'city',
                'address' => [
                    'city' => 'Riga',
                    'country' => 'Latvia',
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs(mapBuilderUser())->getJson('/places/search?q=Riga');

    $response->assertOk()
        ->assertJsonPath('results.0.source', 'nominatim')
        ->assertJsonPath('results.0.external_id', '123')
        ->assertJsonPath('results.0.is_saved', false);
});

test('external place save reuses provider external id without duplicates', function () {
    $payload = [
        'source' => 'nominatim',
        'external_id' => '123',
        'name' => 'Riga',
        'display_name' => 'Riga, Latvia',
        'country' => 'Latvia',
        'city' => 'Riga',
        'latitude' => 56.9496,
        'longitude' => 24.1052,
        'type' => 'city',
    ];

    $this->actingAs(mapBuilderUser())->postJson('/places', $payload)->assertCreated();
    $this->actingAs(mapBuilderUser())->postJson('/places', $payload)->assertCreated();

    expect(Location::query()->where('source', 'nominatim')->where('external_id', '123')->count())->toBe(1);
});

test('custom clicked points can generate a land route preview', function () {
    config([
        'routing.osrm_base_url' => 'https://osrm.test',
        'routing.route_cache_enabled' => true,
    ]);

    Http::fake([
        'https://osrm.test/route/v1/driving/*' => Http::response([
            'routes' => [[
                'distance' => 120000,
                'duration' => 7200,
                'geometry' => [
                    'type' => 'LineString',
                    'coordinates' => [[21.0108, 56.5047], [24.1052, 56.9496]],
                ],
            ]],
        ]),
    ]);

    $response = $this->actingAs(mapBuilderUser())->postJson('/route-builder/preview', [
        'points' => [
            mapBuilderPoint('Liepaja', 56.5047, 21.0108),
            mapBuilderPoint('Riga', 56.9496, 24.1052),
        ],
    ]);

    $response->assertOk()
        ->assertJsonPath('route_type', 'multimodal')
        ->assertJsonPath('legs.0.type', 'land')
        ->assertJsonPath('total_distance_km', 120);

    expect(LandRoute::query()->count())->toBe(1);
    expect(Location::query()->count())->toBe(2);
});

test('saved locations can generate a reusable route template', function () {
    config([
        'routing.osrm_base_url' => 'https://osrm.test',
        'routing.route_cache_enabled' => true,
    ]);

    Http::fake([
        'https://osrm.test/route/v1/driving/*' => Http::response([
            'routes' => [[
                'distance' => 100000,
                'duration' => 3600,
                'geometry' => [
                    'type' => 'LineString',
                    'coordinates' => [[21.0108, 56.5047], [24.1052, 56.9496]],
                ],
            ]],
        ]),
    ]);

    $origin = Location::query()->create([
        'name' => 'Liepaja',
        'type' => 'city',
        'latitude' => 56.5047,
        'longitude' => 21.0108,
    ]);
    $destination = Location::query()->create([
        'name' => 'Riga',
        'type' => 'city',
        'latitude' => 56.9496,
        'longitude' => 24.1052,
    ]);

    $response = $this->actingAs(mapBuilderUser())->postJson('/route-templates', [
        'name' => 'Liepaja to Riga',
        'points' => [
            mapBuilderPoint('Liepaja', 56.5047, 21.0108, $origin->id),
            mapBuilderPoint('Riga', 56.9496, 24.1052, $destination->id),
        ],
    ]);

    $response->assertCreated()
        ->assertJsonPath('route_template.name', 'Liepaja to Riga')
        ->assertJsonCount(2, 'route_template.points')
        ->assertJsonCount(1, 'route_template.legs');

    $template = RouteTemplate::query()->firstOrFail();

    $this->actingAs(mapBuilderUser())
        ->getJson("/route-templates/{$template->id}")
        ->assertOk()
        ->assertJsonPath('route_template.name', 'Liepaja to Riga');
});
