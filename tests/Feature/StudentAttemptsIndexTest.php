<?php

use App\Models\LandRoute;
use App\Models\Location;
use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\TeacherFeedback;
use App\Models\TransportTemplate;
use App\Models\User;
use App\Services\Simulator\SimulationPreviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('student attempts page uses refreshed preview metrics for cards', function () {
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
        'title' => 'Student attempts metrics refresh',
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
        'total_time_hours' => 2,
        'total_cost' => 144,
        'total_fuel_liters' => 26.4,
        'feedback_text' => 'Old inline feedback',
    ]);

    $attempt->routeSegments()->attach($route->id, [
        'position' => 1,
    ]);

    TeacherFeedback::query()->create([
        'simulation_attempt_id' => $attempt->id,
        'assignment_id' => null,
        'grade' => 55,
        'comment' => 'Fresh teacher feedback',
    ]);

    SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $student->id,
        'status' => 'teacher_testing',
        'current_step' => 'intro',
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
            'feedback',
        ])
    );

    expect($expectedPreview['result']['score'])->not->toBe(100);
    expect($expectedPreview['timeline']['summary']['total_hours'])->not->toBe(2.0);

    $this->actingAs($student)
        ->get(route('student.attempts.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Attempts/Index')
            ->has('attempts', 1)
            ->where('attempts.0.id', $attempt->id)
            ->where('attempts.0.score', $expectedPreview['result']['score'])
            ->where('attempts.0.total_time_hours', $expectedPreview['timeline']['summary']['total_hours'])
            ->where('attempts.0.total_cost', fn ($value) => (float) $value === (float) $expectedPreview['result']['total_cost'])
            ->where('attempts.0.total_fuel_liters', fn ($value) => (float) $value === (float) $expectedPreview['result']['fuel_needed_liters'])
            ->where('attempts.0.feedback_text', 'Fresh teacher feedback'));
});
