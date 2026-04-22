<?php

use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('teacher can launch a scenario test attempt from a template', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Teacher sandbox template',
        'evaluation_mode' => 'practice',
    ]);

    $response = $this->actingAs($teacher)
        ->get("/teacher/simulator/template/{$template->id}");

    $attempt = SimulationAttempt::query()
        ->where('user_id', $teacher->id)
        ->where('order_template_id', $template->id)
        ->where('status', 'teacher_testing')
        ->first();

    expect($attempt)->not->toBeNull();

    $response->assertRedirect("/teacher/simulator/{$attempt->id}");
});

test('teacher scenario testing does not reuse an existing student attempt for the same template', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Teacher sandbox isolation',
        'evaluation_mode' => 'practice',
    ]);

    $studentAttempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $teacher->id,
        'status' => 'in_progress',
        'current_step' => 'ship',
        'selected_vehicle_count' => 3,
    ]);

    $response = $this->actingAs($teacher)
        ->get("/teacher/simulator/template/{$template->id}");

    $teacherAttempt = SimulationAttempt::query()
        ->where('user_id', $teacher->id)
        ->where('order_template_id', $template->id)
        ->where('status', 'teacher_testing')
        ->first();

    expect($teacherAttempt)->not->toBeNull();
    expect($teacherAttempt->id)->not->toBe($studentAttempt->id);
    expect($teacherAttempt->current_step)->toBe('intro');

    $response->assertRedirect("/teacher/simulator/{$teacherAttempt->id}");
});

test('teacher simulator uses teacher navigation and routes', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Teacher route config',
        'evaluation_mode' => 'practice',
    ]);

    $attempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $teacher->id,
        'status' => 'teacher_testing',
        'current_step' => 'intro',
    ]);

    $this->actingAs($teacher)
        ->get("/teacher/simulator/{$attempt->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Student/Simulator/Show')
            ->where('simulatorMode', 'teacher')
            ->where('actionBaseUrl', '/teacher/simulator/attempt')
            ->where('backHref', "/teacher/templates/order-templates/{$template->id}")
            ->where('backLabel', 'Atpakaļ uz sagatavi'));

    $this->actingAs($teacher)
        ->postJson("/teacher/simulator/attempt/{$attempt->id}/step", [
            'current_step' => 'transport',
        ])
        ->assertOk()
        ->assertJsonPath('attempt.current_step', 'transport');

    expect($attempt->refresh()->current_step)->toBe('transport');
});

test('teacher can start a fresh test and the previous active sandbox is archived', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Teacher fresh test',
        'evaluation_mode' => 'practice',
    ]);

    $oldAttempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $teacher->id,
        'status' => 'teacher_testing',
        'current_step' => 'simulation',
    ]);

    $response = $this->actingAs($teacher)
        ->post("/teacher/simulator/template/{$template->id}/fresh");

    $newAttempt = SimulationAttempt::query()
        ->where('user_id', $teacher->id)
        ->where('order_template_id', $template->id)
        ->where('status', 'teacher_testing')
        ->where('id', '!=', $oldAttempt->id)
        ->first();

    expect($newAttempt)->not->toBeNull();
    expect($newAttempt->current_step)->toBe('intro');
    expect($oldAttempt->refresh()->status)->toBe('teacher_test_archived');

    $response->assertRedirect("/teacher/simulator/{$newAttempt->id}");
});

test('template show includes the latest teacher test summary', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Teacher latest test summary',
        'evaluation_mode' => 'practice',
    ]);

    $latestAttempt = SimulationAttempt::query()->create([
        'order_template_id' => $template->id,
        'user_id' => $teacher->id,
        'status' => 'teacher_test_submitted',
        'current_step' => 'submit',
        'score' => 78,
        'submitted_at' => now(),
        'preview_result' => [
            'timeline' => [
                'summary' => [
                    'delay_minutes' => 180,
                ],
            ],
            'result' => [
                'score' => 34,
                'is_valid' => false,
                'delay_minutes' => 180,
                'warnings' => ['Termiņš nokavēts.'],
                'score_breakdown' => [
                    'penalties' => [
                        [
                            'key' => 'deadline_delay',
                            'category' => 'time',
                        ],
                        [
                            'key' => 'port_ship_compatibility',
                            'category' => 'compatibility',
                        ],
                    ],
                ],
            ],
        ],
    ]);

    $this->actingAs($teacher)
        ->get("/teacher/templates/order-templates/{$template->id}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Templates/OrderTemplates/Show')
            ->where('latestTeacherTest.id', $latestAttempt->id)
            ->where('latestTeacherTest.status', 'teacher_test_submitted')
            ->where('latestTeacherTest.score', 34)
            ->where('latestTeacherTest.qualitySummary.headline', 'Scenārijs prasa pārskatīšanu')
            ->where('latestTeacherTest.qualitySummary.tone', 'danger')
            ->where('latestTeacherTest.qualitySummary.penalties_count', 2)
            ->where('latestTeacherTest.qualitySummary.insights.0.title', 'Termiņa spiediens')
            ->where('teacherTestStats.total', 1)
            ->where('teacherTestStats.submitted', 1));
});
