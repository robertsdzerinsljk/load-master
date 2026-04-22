<?php

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\TransportTemplate;
use App\Models\User;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('teacher assigned task page refreshes stale preview score data', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $fromLocation = Location::query()->create([
        'name' => 'Riga Warehouse',
    ]);

    $toLocation = Location::query()->create([
        'name' => 'Jelgava Port',
    ]);

    $transport = TransportTemplate::query()->create([
        'name' => 'Truck A',
        'type' => 'truck',
        'capacity_containers' => 1,
        'avg_speed_kmh' => 60,
        'cost_per_km' => 1.2,
        'fuel_consumption_per_100km' => 22,
        'max_range_km' => 500,
    ]);

    $route = LandRoute::query()->create([
        'from_location_id' => $fromLocation->id,
        'to_location_id' => $toLocation->id,
        'distance_km' => 120,
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Assigned task score refresh',
        'cargo_amount_containers' => 3,
        'evaluation_mode' => 'practice',
        'scenario_start_at' => '2026-04-22 08:00:00',
        'deadline_at' => '2026-04-22 08:30:00',
    ]);

    $template->transportTemplates()->attach($transport->id);

    $attempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $student->id,
        'status' => 'submitted',
        'current_step' => 'submit',
        'selected_transport_template_id' => $transport->id,
        'selected_vehicle_count' => 1,
        'preview_result' => [
            'timeline' => [
                'summary' => [
                    'delay_minutes' => 135,
                    'is_within_deadline' => false,
                ],
            ],
            'hints' => [
                'critical' => [],
                'optimization' => [],
                'info' => [],
            ],
            'result' => [
                'required_vehicles' => 3,
                'selected_vehicles' => 1,
                'required_trips' => 3,
                'capacity_per_trip' => 1,
                'vehicle_capacity' => 1,
                'trip_time_hours' => 2,
                'total_cost' => 144,
                'fuel_needed_liters' => 26.4,
                'delay_minutes' => 135,
                'is_valid' => false,
                'is_within_deadline' => false,
                'score' => 100,
                'warnings' => ['Old preview payload without breakdown'],
            ],
        ],
        'score' => 100,
    ]);

    $attempt->routeSegments()->attach($route->id, [
        'position' => 1,
    ]);

    $expectedPreview = app(SimulationPreviewService::class)->build(
        $attempt->load([
            'orderTemplate',
            'selectedTransportTemplate',
            'selectedPort',
            'selectedShip',
            'routeSegments.fromLocation',
            'routeSegments.toLocation',
            'fuelStations.location',
        ])
    );

    expect($expectedPreview['result']['score'])->not->toBe(100);

    $this->actingAs($teacher)
        ->get(route('teacher.assigned-tasks.show', $attempt->id))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/AssignedTasks/Show')
            ->where('attempt.id', $attempt->id)
            ->where('attempt.preview_result.result.score', $expectedPreview['result']['score'])
            ->where(
                'attempt.preview_result.result.score_breakdown.final_score',
                $expectedPreview['result']['score_breakdown']['final_score']
            )
            ->where('attempt.preview_result.result.score_breakdown.penalties.0.key', 'deadline_delay')
            ->where('attempt.preview_result.result.score_breakdown.penalties.1.key', 'insufficient_vehicles')
            ->where('attempt.preview_result.result.score_breakdown.penalties.2.key', 'port_ship_compatibility')
            ->where('attempt.preview_result.result.score_breakdown.penalties.3.key', 'too_many_trips'));
});
