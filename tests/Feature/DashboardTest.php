<?php

use App\Models\SchoolClass;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
    ]);
    $class = SchoolClass::query()->create([
        'teacher_id' => $teacher->id,
        'name' => 'Loģistika LT-2A',
        'code' => 'LT-2A',
        'academic_year' => '2026/2027',
    ]);
    $user = User::factory()->create([
        'role' => 'student',
        'class_id' => $class->id,
    ]);
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('student.dashboard'));
});

test('students without a group are sent to onboarding', function () {
    $user = User::factory()->create([
        'role' => 'student',
        'class_id' => null,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('onboarding.student-group'));
});

test('teacher dashboard receives structured auth display name', function () {
    $teacher = User::factory()->create([
        'name' => 'Legacy Teacher',
        'first_name' => 'Rita',
        'last_name' => 'Ozola',
        'role' => 'teacher',
    ]);

    $this->actingAs($teacher)
        ->get(route('teacher.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Teacher/Dashboard')
            ->where('auth.user.first_name', 'Rita')
            ->where('auth.user.last_name', 'Ozola')
            ->where('auth.user.display_name', 'Rita Ozola'));
});
