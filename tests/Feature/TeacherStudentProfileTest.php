<?php

use App\Models\OrderTemplate;
use App\Models\SimulationAttempt;
use App\Models\TeacherFeedback;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('teacher can open a student profile with assigned tasks and marks', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);

    $student = User::factory()->create([
        'role' => 'student',
        'name' => 'Legacy Student',
        'first_name' => 'Anna',
        'last_name' => 'Kalnina',
    ]);

    $template = OrderTemplate::query()->create([
        'title' => 'Riga delivery practice',
        'scenario_type' => 'route_planning',
        'deadline_date' => '2026-05-20',
        'priority' => 'medium',
    ]);

    $student->assignedOrderTemplates()->attach($template->id, [
        'assigned_at' => now()->subDay(),
        'created_at' => now()->subDay(),
        'updated_at' => now()->subDay(),
    ]);

    $attempt = SimulationAttempt::query()->create([
        'user_id' => $student->id,
        'order_template_id' => $template->id,
        'status' => 'reviewed',
        'current_step' => 'simulation',
        'score' => 82,
        'total_cost' => 450,
        'total_time_hours' => 7.5,
        'total_fuel_liters' => 96,
        'submitted_at' => now()->subHours(2),
    ]);

    TeacherFeedback::query()->create([
        'simulation_attempt_id' => $attempt->id,
        'grade' => 88,
        'comment' => 'Labs darbs ar nelielu kavējumu.',
    ]);

    $this->actingAs($teacher)
        ->get(route('teacher.students.show', $student))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Students/Show')
            ->where('student.display_name', 'Anna Kalnina')
            ->where('stats.assigned_count', 1)
            ->where('stats.reviewed_count', 1)
            ->where('stats.average_grade', 88)
            ->where('assignments.0.title', 'Riga delivery practice')
            ->where('assignments.0.attempt_id', $attempt->id)
            ->where('attempts.0.feedback.grade', 88));
});
