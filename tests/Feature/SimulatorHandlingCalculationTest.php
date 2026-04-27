<?php

use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\Ship;
use App\Models\SimulationAttempt;
use App\Models\User;
use App\Services\HandlingDurationCalculator;
use App\Services\Simulator\ScenarioCompatibilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('container handling duration uses container throughput even when tons are present', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Container duration',
        'cargo_mode' => 'containerized',
        'cargo_amount_containers' => 90,
        'cargo_amount_tons' => 900,
    ]);

    $port = Port::query()->create([
        'name' => 'Container Port',
        'country' => 'LV',
        'supports_container' => true,
        'supports_refrigerated' => true,
        'supports_hazardous' => true,
        'has_crane' => true,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Container Ship',
        'cargo_mode' => 'containerized',
        'supports_container' => true,
        'supports_refrigerated' => true,
        'supports_hazardous' => true,
        'capacity_containers' => 1000,
        'draft_m' => 7,
    ]);

    $attempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $student->id,
        'selected_port_id' => $port->id,
        'selected_ship_id' => $ship->id,
        'selected_loading_method_code' => 'gantry_crane',
        'loading_method_source' => 'port',
        'selected_unloading_method_code' => 'gantry_crane',
        'unloading_method_source' => 'port',
        'status' => 'in_progress',
        'current_step' => 'ship',
    ]);

    $result = app(HandlingDurationCalculator::class)->calculate($attempt);

    expect($result['loading_duration_minutes'])->toBe(120.0);
    expect($result['unloading_duration_minutes'])->toBe(120.0);
});

test('container crane ports expose gantry crane as an inferred handling method', function () {
    $template = OrderTemplate::query()->create([
        'title' => 'Gantry crane inference',
        'cargo_mode' => 'containerized',
        'cargo_amount_containers' => 45,
        'allowed_handling_method_codes' => ['gantry_crane', 'crane'],
    ]);

    $port = Port::query()->create([
        'name' => 'Gantry Port',
        'country' => 'LV',
        'supports_container' => true,
        'supports_refrigerated' => true,
        'supports_hazardous' => true,
        'has_crane' => true,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Container Vessel',
        'cargo_mode' => 'containerized',
        'supports_container' => true,
        'supports_refrigerated' => true,
        'supports_hazardous' => true,
        'capacity_containers' => 1000,
        'draft_m' => 7,
    ]);

    $compatibility = app(ScenarioCompatibilityService::class)->inspect(
        $template,
        $port,
        $ship
    );

    $portMethodCodes = collect($compatibility['handling']['loading']['sources'])
        ->firstWhere('key', 'port')['methods'] ?? [];

    expect(collect($portMethodCodes)->pluck('code')->all())->toContain('gantry_crane');
    expect($compatibility['handling']['loading']['selected']['code'])->toBe('gantry_crane');
});
