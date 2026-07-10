<?php

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\Port;
use App\Models\Ship;
use App\Models\TransportTemplate;
use App\Models\User;
use App\Services\Simulator\ScenarioReadinessService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('template show exposes readiness summary for blocked scenarios', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Blocked readiness template',
        'evaluation_mode' => 'practice',
    ]);

    $this->actingAs($teacher)
        ->get("/teacher/templates/order-templates/{$template->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Templates/OrderTemplates/Show')
            ->where('readiness.status', 'blocked')
            ->where('readiness.has_critical_issues', true)
            ->where('readiness.issues.0.title', 'Nav pievienots transports'));
});

test('teacher cannot assign a scenario with critical readiness issues', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Assignment blocked template',
        'evaluation_mode' => 'practice',
    ]);

    $this->actingAs($teacher)
        ->post('/teacher/students/assign-task', [
            'user_id' => $student->id,
            'order_template_id' => $template->id,
        ])
        ->assertSessionHasErrors([
            'order_template_id' => 'Šo uzdevumu vēl nevar piešķirt. Nav gatavs piešķiršanai.',
        ]);

    expect($student->assignedOrderTemplates()->count())->toBe(0);
});

test('port to ship scenario does not require land route resources', function () {
    $port = Port::query()->create([
        'name' => 'Riga Container Port',
        'country' => 'LV',
        'supports_container' => true,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Baltic Carrier',
        'cargo_mode' => 'containerized',
        'capacity_containers' => 100,
        'draft_m' => 7,
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Port only readiness',
        'scenario_type' => 'port_to_ship',
        'evaluation_mode' => 'practice',
        'cargo_amount_containers' => 10,
        'step_config' => readinessSteps(['intro', 'port', 'ship', 'simulation', 'submit']),
    ]);

    $template->ports()->attach($port->id);
    $template->ships()->attach($ship->id);

    $readiness = app(ScenarioReadinessService::class)->evaluate($template->fresh());

    expect($readiness['has_critical_issues'])->toBeFalse()
        ->and(collect($readiness['issues'])->pluck('title')->all())
        ->not->toContain('Nav pievienots maršruts')
        ->not->toContain('Nav pievienots transports');
});

test('full chain route readiness accepts a land leg ending at the start port', function () {
    $start = Location::query()->create(['name' => 'Riga Warehouse']);
    $portLocation = Location::query()->create(['name' => 'Riga Freeport Terminal']);
    $destination = Location::query()->create(['name' => 'Helsinki']);

    $transport = TransportTemplate::query()->create([
        'name' => 'Container truck',
        'capacity_containers' => 10,
        'avg_speed_kmh' => 70,
    ]);

    $port = Port::query()->create([
        'name' => 'Riga Freeport',
        'country' => 'LV',
        'location_id' => $portLocation->id,
        'supports_container' => true,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Baltic Box',
        'cargo_mode' => 'containerized',
        'capacity_containers' => 500,
        'draft_m' => 7,
    ]);

    $route = LandRoute::query()->create([
        'from_location_id' => $start->id,
        'to_location_id' => $portLocation->id,
        'distance_km' => 20,
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Full chain readiness',
        'scenario_type' => 'full_chain',
        'evaluation_mode' => 'practice',
        'start_location_id' => $start->id,
        'end_location_id' => $destination->id,
        'start_port_id' => $port->id,
        'cargo_amount_containers' => 10,
        'step_config' => readinessSteps(['intro', 'transport', 'route', 'port', 'ship', 'simulation', 'submit']),
    ]);

    $template->transportTemplates()->attach($transport->id);
    $template->landRoutes()->attach($route->id);
    $template->ports()->attach($port->id);
    $template->ships()->attach($ship->id);

    $readiness = app(ScenarioReadinessService::class)->evaluate($template->fresh());

    expect($readiness['has_critical_issues'])->toBeFalse()
        ->and(collect($readiness['issues'])->pluck('title')->all())
        ->not->toContain('Maršruts nebeidzas pie galamērķa');
});

test('teacher can create a port to ship task without land route blockers', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $port = Port::query()->create([
        'name' => 'Klaipeda Container Port',
        'country' => 'LT',
        'supports_container' => true,
    ]);

    $ship = Ship::query()->create([
        'name' => 'Baltic Box Carrier',
        'cargo_mode' => 'containerized',
        'capacity_containers' => 100,
        'draft_m' => 7,
    ]);

    $this->actingAs($teacher)
        ->post('/teacher/templates/order-templates', [
            'title' => 'Teacher-created port task',
            'scenario_type' => 'port_to_ship',
            'evaluation_mode' => 'practice',
            'status' => 'ready',
            'cargo_name' => 'Container cargo',
            'cargo_type' => 'container',
            'cargo_mode' => 'containerized',
            'cargo_amount_containers' => 6,
            'start_port_id' => $port->id,
            'port_ids' => [$port->id],
            'ship_ids' => [$ship->id],
            'scenario_start_at' => now()->toDateTimeString(),
            'deadline_at' => now()->addDay()->toDateTimeString(),
            'compatibility_enforce_port_cargo_support' => false,
            'compatibility_enforce_ship_cargo_support' => false,
            'compatibility_enforce_port_ship_draft' => true,
            'compatibility_enforce_handling_compatibility' => false,
        ])
        ->assertSessionHasNoErrors();

    $template = OrderTemplate::query()
        ->where('title', 'Teacher-created port task')
        ->firstOrFail();

    $readiness = app(ScenarioReadinessService::class)->evaluate($template);

    expect($readiness['has_critical_issues'])->toBeFalse()
        ->and(collect($readiness['issues'])->pluck('title')->all())
        ->not->toContain('Nav pievienots maršruts')
        ->not->toContain('Nav pievienots transports');
});

function readinessSteps(array $enabled): array
{
    return collect([
        'intro',
        'transport',
        'route',
        'fuel',
        'port',
        'ship',
        'simulation',
        'submit',
    ])->mapWithKeys(fn (string $step) => [$step => in_array($step, $enabled, true)])
        ->all();
}
