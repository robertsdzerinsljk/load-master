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
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Date;
use Inertia\Testing\AssertableInertia as Assert;

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

test('timeline accepts immutable current dates when scenario start is omitted', function () {
    Date::use(CarbonImmutable::class);

    try {
        $onRouteLocation = Location::query()->create([
            'name' => 'Immutable Fuel Hub',
            'country' => 'Lithuania',
        ]);

        $onRouteStation = FuelStation::query()->create([
            'location_id' => $onRouteLocation->id,
            'fuel_type' => 'diesel',
            'price_per_liter' => 1.62,
        ]);

        $attempt = makeFuelPlanAttempt($onRouteStation, null);
        $route = $attempt->routeSegments()->first();

        RouteFuelStop::query()->create([
            'land_route_id' => $route->id,
            'fuel_station_id' => $onRouteStation->id,
            'distance_from_start_km' => 120,
        ]);

        $timeline = app(SimulationTimelineService::class)->build($attempt->fresh());

        expect($timeline['events'])->not->toBeEmpty();
    } finally {
        Date::useDefault();
    }
});

test('preview treats resource and handling compatibility as scoring feedback instead of a blocker', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Practice Fuel Hub',
        'country' => 'Lithuania',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $attempt->orderTemplate->update([
        'scenario_type' => 'full_chain',
        'requires_loading_method_choice' => true,
        'requires_unloading_method_choice' => true,
        'step_config' => [
            'intro' => true,
            'transport' => true,
            'route' => true,
            'fuel' => true,
            'port' => true,
            'ship' => true,
            'simulation' => true,
            'submit' => true,
        ],
    ]);
    $attempt->selectedPort->update([
        'supports_container' => false,
    ]);
    $attempt->selectedShip->update([
        'cargo_mode' => 'bulk',
        'supports_container' => false,
    ]);
    $attempt->update([
        'selected_loading_method_code' => 'gantry_crane',
        'loading_method_source' => 'port',
        'selected_unloading_method_code' => 'gantry_crane',
        'unloading_method_source' => 'ship',
    ]);
    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.is_valid'))->toBeTrue();
    expect(collect(data_get($preview, 'result.score_breakdown.penalties', []))->pluck('key')->all())
        ->toContain('port_ship_compatibility');
    expect(collect(data_get($preview, 'hints.optimization', []))->join(' '))
        ->toContain('saderibas sodu');
});

test('land transport preview does not require port or ship resources', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Land Only Fuel Hub',
        'country' => 'Latvia',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $attempt->update([
        'selected_port_id' => null,
        'selected_ship_id' => null,
    ]);
    $attempt->orderTemplate->update([
        'scenario_type' => 'land_transport',
        'step_config' => [
            'intro' => true,
            'transport' => true,
            'route' => true,
            'fuel' => true,
            'port' => false,
            'ship' => false,
            'simulation' => true,
            'submit' => true,
        ],
    ]);
    $attempt->selectedTransportTemplate->update([
        'max_range_km' => 1000,
    ]);

    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.is_valid'))->toBeTrue();
    expect(collect(data_get($preview, 'result.score_breakdown.penalties', []))->pluck('key')->all())
        ->not->toContain('port_ship_compatibility');
});

test('missing ship warning is shown once in Latvian', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Ship Missing Fuel Hub',
        'country' => 'Latvia',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $attempt->update([
        'selected_ship_id' => null,
    ]);
    $attempt->orderTemplate->update([
        'scenario_type' => 'full_chain',
        'step_config' => [
            'intro' => true,
            'transport' => true,
            'route' => true,
            'fuel' => true,
            'port' => true,
            'ship' => true,
            'simulation' => true,
            'submit' => true,
        ],
    ]);
    $attempt->selectedTransportTemplate->update([
        'max_range_km' => 1000,
    ]);

    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $warnings = collect(data_get(app(SimulationPreviewService::class)->build($attempt->fresh()), 'result.warnings', []));

    expect($warnings->filter(fn (string $warning) => $warning === 'Nav izvēlēts kuģis.')->count())->toBe(1);
    expect($warnings->contains('Ship is not selected.'))->toBeFalse();
    expect($warnings->contains('Port and ship must both be selected before compatibility can be verified.'))->toBeFalse();
});

test('simulator hides the fuel step when refuel planning is disabled', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Hidden Fuel Step Hub',
        'country' => 'Latvia',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $attempt->orderTemplate->update([
        'requires_refuel_planning' => false,
        'step_config' => [
            'intro' => true,
            'transport' => true,
            'route' => true,
            'fuel' => true,
            'port' => false,
            'ship' => false,
            'simulation' => true,
            'submit' => true,
        ],
    ]);

    $this->actingAs(User::query()->findOrFail($attempt->user_id))
        ->get("/student/simulator/{$attempt->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Simulator/Show')
            ->where('availableSteps', fn ($steps) => !in_array('fuel', collect($steps)->all(), true)));
});

test('preview flags a selected route that does not match task start and end locations', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Endpoint Fuel Hub',
        'country' => 'Latvia',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $route = $attempt->routeSegments()->first();

    $attempt->orderTemplate->update([
        'start_location_id' => $route->to_location_id,
        'end_location_id' => $route->from_location_id,
    ]);
    $attempt->selectedTransportTemplate->update([
        'max_range_km' => 1000,
    ]);

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.is_valid'))->toBeFalse();
    expect(data_get($preview, 'route.endpoint_valid'))->toBeFalse();
    expect(collect(data_get($preview, 'result.score_breakdown.penalties', []))->pluck('key')->all())
        ->toContain('route_endpoints');
    expect(collect(data_get($preview, 'hints.critical', []))->join(' '))
        ->toContain('sakuma un gala');
});

test('preview penalizes selecting more vehicles than the cargo needs', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Over Fleet Fuel Hub',
        'country' => 'Latvia',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $attempt->update([
        'selected_vehicle_count' => 4,
    ]);
    $attempt->orderTemplate->update([
        'cargo_amount_containers' => 20,
    ]);
    $attempt->selectedTransportTemplate->update([
        'capacity_containers' => 10,
        'max_range_km' => 1000,
    ]);

    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.required_vehicles'))->toBe(2);
    expect(data_get($preview, 'result.selected_vehicles'))->toBe(4);
    expect(collect(data_get($preview, 'result.score_breakdown.penalties', []))->pluck('key')->all())
        ->toContain('too_many_vehicles');
    expect(collect(data_get($preview, 'hints.optimization', []))->join(' '))
        ->toContain('neefektivi');
});

test('preview fuel and transport cost scale with outbound and return trip distance', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Multi Trip Fuel Hub',
        'country' => 'Lithuania',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $attempt->orderTemplate->update([
        'cargo_amount_containers' => 25,
    ]);
    $attempt->selectedTransportTemplate->update([
        'max_range_km' => 1000,
    ]);
    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.required_trips'))->toBe(3);
    expect(data_get($preview, 'route.total_driven_distance_km'))->toBe(1200.0);
    expect(data_get($preview, 'result.fuel_needed_liters'))->toBe(348.0);
    expect(data_get($preview, 'fuel.estimated_refuel_events'))->toBe(1);
    expect(data_get($preview, 'fuel.assumes_depot_refuel'))->toBeTrue();
    expect(data_get($preview, 'result.cost_breakdown.fuel_cost'))->toBe(563.76);
    expect(data_get($preview, 'result.cost_breakdown.transport_cost'))->toBe(1560.0);
    expect(collect(data_get($preview, 'hints.info', []))->join(' '))
        ->toContain('neietilpst viena baka');
});

test('selected fuel station price changes fuel cost and total cost', function () {
    $cheapLocation = Location::query()->create([
        'name' => 'Cheap Fuel Hub',
        'country' => 'Latvia',
    ]);
    $expensiveLocation = Location::query()->create([
        'name' => 'Expensive Fuel Hub',
        'country' => 'Latvia',
    ]);

    $cheapStation = FuelStation::query()->create([
        'location_id' => $cheapLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.20,
    ]);
    $expensiveStation = FuelStation::query()->create([
        'location_id' => $expensiveLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.80,
    ]);

    $cheapAttempt = makeFuelPlanAttempt($cheapStation, '2026-04-28 08:00:00');
    $expensiveAttempt = makeFuelPlanAttempt($expensiveStation, '2026-04-28 08:00:00');

    foreach ([$cheapAttempt, $expensiveAttempt] as $attempt) {
        $attempt->selectedTransportTemplate->update([
            'max_range_km' => 1000,
        ]);
    }

    RouteFuelStop::query()->create([
        'land_route_id' => $cheapAttempt->routeSegments()->first()->id,
        'fuel_station_id' => $cheapStation->id,
        'distance_from_start_km' => 120,
    ]);
    RouteFuelStop::query()->create([
        'land_route_id' => $expensiveAttempt->routeSegments()->first()->id,
        'fuel_station_id' => $expensiveStation->id,
        'distance_from_start_km' => 120,
    ]);

    $cheapPreview = app(SimulationPreviewService::class)->build($cheapAttempt->fresh());
    $expensivePreview = app(SimulationPreviewService::class)->build($expensiveAttempt->fresh());

    expect(data_get($cheapPreview, 'result.fuel_needed_liters'))
        ->toBe(data_get($expensivePreview, 'result.fuel_needed_liters'));
    expect(data_get($cheapPreview, 'result.cost_breakdown.fuel_cost'))->toBe(83.52);
    expect(data_get($expensivePreview, 'result.cost_breakdown.fuel_cost'))->toBe(125.28);
    expect(data_get($expensivePreview, 'result.total_cost'))
        ->toBeGreaterThan(data_get($cheapPreview, 'result.total_cost'));
});

test('preview uses a default fuel price when selected station has no price', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Unpriced Fuel Hub',
        'country' => 'Latvia',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => null,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00', [
        'costs' => [
            'default_fuel_price_per_liter' => 1.70,
        ],
    ]);
    $attempt->selectedTransportTemplate->update([
        'max_range_km' => 1000,
    ]);

    RouteFuelStop::query()->create([
        'land_route_id' => $attempt->routeSegments()->first()->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $preview = app(SimulationPreviewService::class)->build($attempt->fresh());

    expect(data_get($preview, 'result.fuel_needed_liters'))->toBe(69.6);
    expect(data_get($preview, 'result.cost_breakdown.fuel_price_per_liter'))->toBe(1.70);
    expect(data_get($preview, 'result.cost_breakdown.fuel_price_source'))->toBe('default');
    expect(data_get($preview, 'result.cost_breakdown.fuel_cost'))->toBe(118.32);
    expect(collect(data_get($preview, 'hints.info', []))->join(' '))
        ->toContain('noklusejuma cenu');
});

test('simulator page refreshes stored previews that use old distance metrics', function () {
    $stationLocation = Location::query()->create([
        'name' => 'Stored Preview Fuel Hub',
        'country' => 'Lithuania',
    ]);

    $station = FuelStation::query()->create([
        'location_id' => $stationLocation->id,
        'fuel_type' => 'diesel',
        'price_per_liter' => 1.62,
    ]);

    $attempt = makeFuelPlanAttempt($station, '2026-04-28 08:00:00');
    $attempt->orderTemplate->update([
        'cargo_amount_containers' => 25,
    ]);
    $attempt->selectedTransportTemplate->update([
        'max_range_km' => 1000,
    ]);
    $attempt->update([
        'preview_result' => [
            'route' => [
                'distance_km' => 240,
                'start' => 'Riga Depot',
                'end' => 'Klaipeda Terminal',
            ],
            'result' => [
                'fuel_needed_liters' => 30.8,
                'total_cost' => 280.99,
                'required_trips' => 3,
                'is_valid' => true,
            ],
            'timeline' => [
                'summary' => [
                    'total_minutes' => 60,
                ],
            ],
            'hints' => [
                'critical' => [],
                'optimization' => [],
                'info' => [],
            ],
        ],
    ]);
    $route = $attempt->routeSegments()->first();

    RouteFuelStop::query()->create([
        'land_route_id' => $route->id,
        'fuel_station_id' => $station->id,
        'distance_from_start_km' => 120,
    ]);

    $this->actingAs(User::query()->findOrFail($attempt->user_id))
        ->get("/student/simulator/{$attempt->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Simulator/Show')
            ->where('attempt.preview_result.route.total_driven_distance_km', fn ($value) => (float) $value === 1200.0)
            ->where('attempt.preview_result.result.fuel_needed_liters', fn ($value) => (float) $value === 348.0)
            ->where('attempt.preview_result.result.cost_breakdown.transport_cost', fn ($value) => (float) $value === 1560.0));
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
