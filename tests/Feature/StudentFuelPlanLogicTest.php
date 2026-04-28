<?php

use App\Models\FuelStation;
use App\Models\LandRoute;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\RouteFuelStop;
use App\Models\Ship;
use App\Models\SimulationAttempt;
use App\Models\TransportTemplate;
use App\Models\User;
use App\Services\Simulator\SimulationPreviewService;
use App\Services\Simulator\SimulationTimelineService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeFuelPlanAttempt(
    FuelStation $selectedStation,
    ?string $scenarioStartAt = null,
    array $scenarioConfig = []
): SimulationAttempt
{
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $start = Location::query()->create([
        'name' => 'Riga Depot',
        'country' => 'Latvia',
    ]);

    $end = Location::query()->create([
        'name' => 'Klaipeda Terminal',
        'country' => 'Lithuania',
    ]);

    $portLocation = Location::query()->create([
        'name' => 'Klaipeda Port Area',
        'country' => 'Lithuania',
    ]);

    $route = LandRoute::query()->create([
        'from_location_id' => $start->id,
        'to_location_id' => $end->id,
        'distance_km' => 240,
        'estimated_time_hours' => 4,
    ]);

    $transport = TransportTemplate::query()->create([
        'name' => 'Road Fleet A',
        'type' => 'truck',
        'capacity_containers' => 10,
        'avg_speed_kmh' => 60,
        'cost_per_km' => 1.3,
        'fuel_consumption_per_100km' => 29,
        'max_range_km' => 150,
    ]);

    $port = Port::query()->create([
        'name' => 'Klaipeda Port',
        'country' => 'Lithuania',
        'location_id' => $portLocation->id,
        'max_draft_m' => 12,
        'supports_container' => true,
        'has_crane' => true,
        'loading_rate_containers_per_hour' => 30,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Baltic Carrier',
        'cargo_mode' => 'containerized',
        'supports_container' => true,
        'has_onboard_crane' => true,
        'draft_m' => 9,
        'capacity_containers' => 100,
        'loading_capacity_containers_per_hour' => 30,
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Fuel plan logic',
        'scenario_type' => 'land_transport',
        'evaluation_mode' => 'practice',
        'cargo_mode' => 'containerized',
        'cargo_amount_containers' => 10,
        'deadline_at' => now()->addDays(2),
        'scenario_start_at' => $scenarioStartAt ?? now(),
        'scenario_config' => $scenarioConfig,
    ]);

    $attempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $student->id,
        'selected_transport_template_id' => $transport->id,
        'selected_port_id' => $port->id,
        'selected_ship_id' => $ship->id,
        'selected_vehicle_count' => 1,
        'status' => 'in_progress',
        'current_step' => 'simulation',
    ]);

    $attempt->routeSegments()->attach($route->id, [
        'position' => 1,
    ]);

    $attempt->fuelStations()->attach($selectedStation->id, [
        'position' => 1,
    ]);

    return $attempt;
}

test('preview accepts a fuel stop that exists on the selected route in logical order', function () {
    $onRouteLocation = Location::query()->create([
        'name' => 'Panevezys Fuel Hub',
        'country' => 'Lithuania',
    ]);

    $onRouteStation = FuelStation::query()->create([
        'location_id' => $onRouteLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($onRouteStation);
    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $onRouteStation->id,
        'distance_from_start_km' => 120,
    ]);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.is_valid'))->toBeTrue();
    expect(data_get($preview, 'fuel.stops.0.is_logical'))->toBeTrue();
    expect(data_get($preview, 'fuel.stops.0.distance_from_start_km'))->toBe(120.0);
    expect(data_get($preview, 'fuel.approx_leg_distance_km'))->toBe(120.0);
});

test('preview rejects a fuel stop that is not on the selected route', function () {
    $offRouteLocation = Location::query()->create([
        'name' => 'Warsaw Fuel Hub',
        'country' => 'Poland',
    ]);

    $offRouteStation = FuelStation::query()->create([
        'location_id' => $offRouteLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.67,
    ]);

    $attempt = makeFuelPlanAttempt($offRouteStation);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.is_valid'))->toBeFalse();
    expect(data_get($preview, 'fuel.stops.0.is_logical'))->toBeFalse();
    expect(data_get($preview, 'fuel.stops.0.distance_from_start_km'))->toBeNull();
    expect(collect(data_get($preview, 'hints.critical', []))
        ->contains(fn (string $hint) => str_contains($hint, 'neatrodas uz izveidota marsruta')))
        ->toBeTrue();
});

test('timeline inserts logical fuel stops into the actual route order', function () {
    $onRouteLocation = Location::query()->create([
        'name' => 'Panevezys Fuel Hub',
        'country' => 'Lithuania',
    ]);

    $onRouteStation = FuelStation::query()->create([
        'location_id' => $onRouteLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($onRouteStation, '2026-04-28 08:00:00');
    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $onRouteStation->id,
        'distance_from_start_km' => 120,
    ]);

    $timeline = app(SimulationTimelineService::class)->build($attempt->fresh());
    $events = collect($timeline['events']);
    $driveEvents = $events->where('type', 'drive')->values();
    $fuelEvent = $events->firstWhere('type', 'fuel_stop');

    expect($driveEvents)->toHaveCount(2);
    expect(data_get($driveEvents[0], 'meta.to_location_name'))->toBe('Panevezys Fuel Hub');
    expect(data_get($driveEvents[1], 'meta.from_location_name'))->toBe('Panevezys Fuel Hub');
    expect(data_get($fuelEvent, 'meta.distance_from_start_km'))->toBe(120.0);
});

test('night operations cost more than the same daytime operations', function () {
    $dayLocation = Location::query()->create([
        'name' => 'Day Fuel Hub',
        'country' => 'Lithuania',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $dayLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $config = [
        'costs' => [
            'day_shift_start_hour' => 6,
            'night_shift_start_hour' => 20,
            'labor_cost_per_hour_day' => 20,
            'machine_cost_per_hour_day' => 40,
            'night_shift_multiplier' => 1.5,
        ],
    ];

    $dayAttempt = makeFuelPlanAttempt($station, '2026-04-28 10:00:00', $config);
    $nightAttempt = makeFuelPlanAttempt($station, '2026-04-28 22:00:00', $config);

    $routeDay = $dayAttempt->routeSegments()->first();
    $routeNight = $nightAttempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $routeDay->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    RouteFuelStop::query()->create([
        'land_route_id' => $routeNight->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $dayTimeline = app(SimulationTimelineService::class)->build($dayAttempt->fresh());
    $nightTimeline = app(SimulationTimelineService::class)->build($nightAttempt->fresh());

    expect(data_get($dayTimeline, 'costs.operations_total_eur'))->toBeLessThan(
        data_get($nightTimeline, 'costs.operations_total_eur')
    );
    expect(data_get($nightTimeline, 'costs.night_operations_eur'))->toBeGreaterThan(0);
});
