<?php

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\Port;
use App\Models\SeaRoute;
use App\Services\Routing\RouteCalculationService;
use Illuminate\Support\Facades\Http;

function routingLocation(string $name, float $latitude, float $longitude): Location
{
    return Location::query()->create([
        'name' => $name,
        'type' => 'city',
        'country' => 'LV',
        'latitude' => $latitude,
        'longitude' => $longitude,
    ]);
}

function routingPort(string $name, float $latitude, float $longitude): Port
{
    $location = Location::query()->create([
        'name' => $name.' location',
        'type' => 'port_terminal',
        'country' => 'LV',
        'latitude' => $latitude,
        'longitude' => $longitude,
    ]);

    return Port::query()->create([
        'name' => $name,
        'country' => 'LV',
        'location_id' => $location->id,
    ]);
}

test('land route calculation uses osrm and caches the result', function () {
    config([
        'routing.land_routing_provider' => 'osrm',
        'routing.osrm_base_url' => 'https://osrm.test',
        'routing.route_cache_enabled' => true,
    ]);

    Http::fake([
        'https://osrm.test/route/v1/driving/*' => Http::response([
            'routes' => [
                [
                    'distance' => 123450,
                    'duration' => 7200,
                    'geometry' => [
                        'type' => 'LineString',
                        'coordinates' => [[21.0, 56.0], [24.0, 57.0]],
                    ],
                ],
            ],
        ]),
    ]);

    $origin = routingLocation('Liepaja', 56.5047, 21.0108);
    $destination = routingLocation('Riga', 56.9496, 24.1052);

    $result = app(RouteCalculationService::class)->land($origin, $destination);

    expect($result)
        ->route_type->toBe('land')
        ->distance_km->toBe(123.45)
        ->duration_hours->toBe(2.0)
        ->provider->toBe('osrm')
        ->errors->toBe([]);

    expect(LandRoute::query()->count())->toBe(1);
    Http::assertSentCount(1);

    app(RouteCalculationService::class)->land($origin, $destination);

    Http::assertSentCount(1);
});

test('land route calculation falls back to approximation when osrm fails', function () {
    config([
        'routing.land_routing_provider' => 'osrm',
        'routing.osrm_base_url' => 'https://osrm.test',
        'routing.route_cache_enabled' => true,
    ]);

    Http::fake([
        'https://osrm.test/route/v1/driving/*' => Http::response([], 500),
    ]);

    $origin = routingLocation('Liepaja', 56.5047, 21.0108);
    $destination = routingLocation('Riga', 56.9496, 24.1052);

    $result = app(RouteCalculationService::class)->land($origin, $destination);

    expect($result)
        ->route_type->toBe('land')
        ->provider->toBe('approximation')
        ->errors->toBe([]);
    expect($result['distance_km'])->toBeGreaterThan(0);
    expect($result['warnings'])->not->toBeEmpty();
    expect(LandRoute::query()->where('provider', 'approximation')->exists())->toBeTrue();
});

test('manual sea route is returned before approximation', function () {
    $origin = routingPort('Riga port', 56.9667, 24.1000);
    $destination = routingPort('Helsinki port', 60.1699, 24.9384);

    SeaRoute::query()->create([
        'origin_port_id' => $origin->id,
        'destination_port_id' => $destination->id,
        'distance_km' => 480,
        'duration_hours' => 18,
        'provider' => 'manual',
        'geometry_geojson' => [
            'type' => 'LineString',
            'coordinates' => [[24.1, 56.9667], [24.9384, 60.1699]],
        ],
    ]);

    $result = app(RouteCalculationService::class)->sea($origin, $destination);

    expect($result)
        ->route_type->toBe('sea')
        ->distance_km->toBe(480.0)
        ->duration_hours->toBe(18.0)
        ->provider->toBe('manual')
        ->errors->toBe([]);
});

test('sea route falls back to approximate haversine calculation', function () {
    config(['routing.sea_routing_provider' => 'manual']);

    $origin = routingPort('Ventspils port', 57.3894, 21.5606);
    $destination = routingPort('Stockholm port', 59.3293, 18.0686);

    $result = app(RouteCalculationService::class)->sea($origin, $destination);

    expect($result['route_type'])->toBe('sea');
    expect($result['provider'])->toBe('approximation');
    expect($result['distance_km'])->toBeGreaterThan(250);
    expect($result['duration_hours'])->toBeGreaterThan(0);
    expect($result['warnings'])->not->toBeEmpty();
    expect(SeaRoute::query()->where('provider', 'approximation')->exists())->toBeTrue();
});

test('multimodal route totals distance time and cost across legs', function () {
    $origin = routingLocation('Factory', 56.5047, 21.0108);
    $portLocation = routingLocation('Port city', 57.3894, 21.5606);

    LandRoute::query()->create([
        'from_location_id' => $origin->id,
        'to_location_id' => $portLocation->id,
        'distance_km' => 120,
        'estimated_time_hours' => 2,
        'provider' => 'manual',
    ]);

    $originPort = routingPort('Ventspils', 57.3894, 21.5606);
    $destinationPort = routingPort('Stockholm', 59.3293, 18.0686);

    SeaRoute::query()->create([
        'origin_port_id' => $originPort->id,
        'destination_port_id' => $destinationPort->id,
        'distance_km' => 410,
        'duration_hours' => 14,
        'provider' => 'manual',
    ]);

    $result = app(RouteCalculationService::class)->multimodal([
        [
            'type' => 'land',
            'origin_location_id' => $origin->id,
            'destination_location_id' => $portLocation->id,
        ],
        [
            'type' => 'port_handling',
            'port' => 'Ventspils',
            'duration_hours' => 3,
            'cost' => 200,
        ],
        [
            'type' => 'sea',
            'origin_port_id' => $originPort->id,
            'destination_port_id' => $destinationPort->id,
        ],
    ]);

    expect($result)
        ->route_type->toBe('multimodal')
        ->total_distance_km->toBe(530.0)
        ->total_duration_hours->toBe(19.0)
        ->total_cost->toBe(200.0)
        ->errors->toBe([]);
    expect($result['legs'])->toHaveCount(3);
});
