<?php

use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeInvalidAttempt(User $student, string $evaluationMode): SimulationAttempt
{
    $template = OrderTemplate::query()->create([
        'title' => "Submit guard {$evaluationMode}",
        'evaluation_mode' => $evaluationMode,
    ]);

    return SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $student->id,
        'status' => 'in_progress',
        'current_step' => 'simulation',
        'preview_result' => [
            'result' => [
                'is_valid' => false,
                'score_breakdown' => [
                    'penalties' => [
                        [
                            'key' => 'insufficient_vehicles',
                        ],
                    ],
                ],
            ],
        ],
    ]);
}

test('practice mode returns a target step when moving to submit is blocked', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $attempt = makeInvalidAttempt($student, 'practice');

    $this->actingAs($student)
        ->postJson("/student/simulator/attempt/{$attempt->id}/step", [
            'current_step' => 'submit',
        ])
        ->assertStatus(422)
        ->assertJson([
            'target_step' => 'transport',
        ]);
});

test('practice mode rejects invalid submit attempts and keeps the attempt open', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $attempt = makeInvalidAttempt($student, 'practice');

    $this->actingAs($student)
        ->postJson("/student/simulator/attempt/{$attempt->id}/submit")
        ->assertStatus(422)
        ->assertJson([
            'target_step' => 'transport',
        ]);

    expect($attempt->refresh()->status)->toBe('in_progress');
    expect($attempt->current_step)->toBe('simulation');
});

test('exam mode allows invalid submit attempts without exposing hints or step redirects', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $attempt = makeInvalidAttempt($student, 'exam');

    $this->actingAs($student)
        ->postJson("/student/simulator/attempt/{$attempt->id}/submit")
        ->assertOk()
        ->assertJsonMissingPath('target_step')
        ->assertJsonPath('attempt.status', 'submitted');

    expect($attempt->refresh()->status)->toBe('submitted');
    expect($attempt->current_step)->toBe('submit');
});

test('exam mode can move to submit step even when preview is invalid', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $attempt = makeInvalidAttempt($student, 'exam');

    $this->actingAs($student)
        ->postJson("/student/simulator/attempt/{$attempt->id}/step", [
            'current_step' => 'submit',
        ])
        ->assertOk()
        ->assertJsonMissingPath('target_step')
        ->assertJsonPath('attempt.current_step', 'submit');

    expect($attempt->refresh()->current_step)->toBe('submit');
});

test('changing a planning step invalidates preview without nulling is_valid', function () {
    $student = User::factory()->create([
        'role' => 'student',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Invalidate preview safely',
        'evaluation_mode' => 'practice',
    ]);

    $attempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $student->id,
        'status' => 'in_progress',
        'current_step' => 'transport',
        'selected_vehicle_count' => 2,
        'preview_result' => [
            'result' => [
                'is_valid' => true,
            ],
        ],
        'is_valid' => true,
        'score' => 88,
    ]);

    $this->actingAs($student)
        ->postJson("/student/simulator/attempt/{$attempt->id}/step", [
            'current_step' => 'transport',
            'selected_vehicle_count' => 1,
        ])
        ->assertOk();

    $attempt->refresh();

    expect($attempt->preview_result)->toBeNull();
    expect($attempt->is_valid)->toBeFalse();
    expect($attempt->score)->toBeNull();
});
