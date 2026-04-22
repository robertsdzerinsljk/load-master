<?php

use App\Models\OrderTemplate;
use App\Models\User;
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
