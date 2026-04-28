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

test('resource cargo incompatibility does not hide handling equipment choices', function () {
    $template = OrderTemplate::query()->create([
        'title' => 'Handling choice remains available',
        'cargo_mode' => 'containerized',
        'cargo_amount_containers' => 20,
        'requires_loading_method_choice' => true,
        'requires_unloading_method_choice' => true,
    ]);

    $port = Port::query()->create([
        'name' => 'Equipment Only Port',
        'country' => 'LV',
        'supports_container' => false,
        'supports_refrigerated' => true,
        'supports_hazardous' => true,
        'has_crane' => true,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Sparse Ship',
        'cargo_mode' => null,
        'supports_container' => false,
        'capacity_containers' => 1000,
        'draft_m' => 7,
    ]);

    $compatibility = app(ScenarioCompatibilityService::class)->inspect(
        $template,
        $port,
        $ship
    );

    $loadingPortSource = collect($compatibility['handling']['loading']['sources'])
        ->firstWhere('key', 'port');
    $unloadingPortSource = collect($compatibility['handling']['unloading']['sources'])
        ->firstWhere('key', 'port');

    expect($compatibility['port']['compatible'])->toBeFalse();
    expect($loadingPortSource['enabled'])->toBeTrue();
    expect(collect($loadingPortSource['methods'])->pluck('code')->all())->toContain('crane');
    expect($unloadingPortSource['enabled'])->toBeTrue();
    expect(collect($unloadingPortSource['methods'])->pluck('code')->all())->toContain('crane');
});

test('handling choices fall back to scenario methods when resource has no matching methods', function () {
    $template = OrderTemplate::query()->create([
        'title' => 'Fallback handling choices',
        'cargo_mode' => 'liquid',
        'cargo_amount_tons' => 100,
        'requires_loading_method_choice' => true,
        'requires_unloading_method_choice' => true,
    ]);

    $port = Port::query()->create([
        'name' => 'Dry Port',
        'country' => 'LV',
        'supports_liquid' => false,
        'has_crane' => false,
        'has_forklift' => false,
        'has_pump' => false,
        'has_conveyor' => false,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Dry Ship',
        'supports_liquid' => false,
        'has_onboard_crane' => false,
    ]);

    $compatibility = app(ScenarioCompatibilityService::class)->inspect(
        $template,
        $port,
        $ship
    );

    $loadingPortSource = collect($compatibility['handling']['loading']['sources'])
        ->firstWhere('key', 'port');
    $unloadingShipSource = collect($compatibility['handling']['unloading']['sources'])
        ->firstWhere('key', 'ship');

    expect($loadingPortSource['enabled'])->toBeTrue();
    expect(collect($loadingPortSource['methods'])->pluck('code')->all())->toContain('pump');
    expect($unloadingShipSource['enabled'])->toBeTrue();
    expect(collect($unloadingShipSource['methods'])->pluck('code')->all())->toContain('pump');
});
