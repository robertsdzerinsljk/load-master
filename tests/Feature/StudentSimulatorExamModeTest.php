<?php

use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('exam mode simulator payload hides detailed preview diagnostics from students', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Exam simulator hardening',
        'evaluation_mode' => 'exam',
    ]);

    $attempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $student->id,
        'status' => 'in_progress',
        'current_step' => 'simulation',
        'preview_result' => [
            'timeline' => [
                'events' => [
                    [
                        'type' => 'drive',
                        'label' => 'Drive to port',
                        'start_at' => '2026-04-22 08:00:00',
                        'end_at' => '2026-04-22 10:00:00',
                        'duration_minutes' => 120,
                    ],
                ],
                'summary' => [
                    'total_hours' => 4.5,
                    'delay_minutes' => 90,
                    'is_within_deadline' => false,
                ],
            ],
            'hints' => [
                'critical' => ['Leaky hint'],
                'optimization' => ['Leaky optimization'],
                'info' => ['Leaky info'],
            ],
            'result' => [
                'is_valid' => false,
                'score' => 61,
                'score_breakdown' => [
                    'final_score' => 61,
                    'penalties' => [
                        ['key' => 'deadline_delay'],
                    ],
                ],
                'warnings' => ['Leaky warning'],
                'required_vehicles' => 2,
                'selected_vehicles' => 1,
                'vehicle_capacity' => 1,
                'capacity_per_trip' => 1,
                'required_trips' => 2,
                'delay_minutes' => 90,
                'is_within_deadline' => false,
                'needs_refuel' => true,
            ],
        ],
    ]);

    $this->actingAs($student)
        ->get("/student/simulator/{$attempt->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Simulator/Show')
            ->where('attempt.preview_result.hints.critical', [])
            ->where('attempt.preview_result.hints.optimization', [])
            ->where('attempt.preview_result.hints.info', [])
            ->where('attempt.preview_result.timeline.events', [])
            ->where('attempt.preview_result.timeline.summary.delay_minutes', null)
            ->where('attempt.preview_result.timeline.summary.is_within_deadline', null)
            ->where('attempt.preview_result.result.score', null)
            ->where('attempt.preview_result.result.score_breakdown', null)
            ->where('attempt.preview_result.result.warnings', [])
            ->where('attempt.preview_result.result.required_vehicles', null)
            ->where('attempt.preview_result.result.selected_vehicles', null)
            ->where('attempt.preview_result.result.required_trips', null)
            ->where('attempt.preview_result.result.delay_minutes', null)
            ->where('attempt.preview_result.result.needs_refuel', null));
});
