<?php

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('admin can create update and delete users', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $teacher = User::factory()->create(['role' => 'teacher']);
    $class = SchoolClass::query()->create([
        'teacher_id' => $teacher->id,
        'name' => 'Loģistika LT-2A',
        'code' => 'LT-2A',
        'academic_year' => '2026/2027',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'first_name' => 'Anna',
            'last_name' => 'Kalniņa',
            'email' => 'anna@example.test',
            'role' => 'student',
            'is_admin' => false,
            'class_id' => $class->id,
            'password' => 'password',
        ])
        ->assertRedirect();

    $student = User::query()->where('email', 'anna@example.test')->firstOrFail();
    expect($student->role)->toBe('student')
        ->and($student->class_id)->toBe($class->id)
        ->and(Hash::check('password', $student->password))->toBeTrue();

    $this->actingAs($admin)
        ->put(route('admin.users.update', $student), [
            'first_name' => 'Anna',
            'last_name' => 'Ozola',
            'email' => 'anna.ozola@example.test',
            'role' => 'teacher',
            'is_admin' => true,
            'class_id' => $class->id,
            'password' => '',
        ])
        ->assertRedirect();

    $student->refresh();
    expect($student->role)->toBe('teacher')
        ->and($student->class_id)->toBeNull()
        ->and($student->is_admin)->toBeTrue()
        ->and($student->email)->toBe('anna.ozola@example.test');

    $this->actingAs($admin)
        ->delete(route('admin.users.destroy', $student))
        ->assertRedirect();

    expect(User::query()->whereKey($student->id)->exists())->toBeFalse();
});

test('non admins cannot open admin user management', function () {
    $teacher = User::factory()->create(['role' => 'teacher']);

    $this->actingAs($teacher)
        ->get(route('admin.users'))
        ->assertForbidden();
});

test('teacher with admin access can open user management without losing teacher role', function () {
    $teacher = User::factory()->create([
        'role' => 'teacher',
        'is_admin' => true,
    ]);

    $this->actingAs($teacher)
        ->get(route('teacher.dashboard'))
        ->assertOk();

    $this->actingAs($teacher)
        ->get(route('admin.users'))
        ->assertOk();
});

test('admin cannot remove their own last admin access', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
        'is_admin' => true,
    ]);

    $this->actingAs($admin)
        ->put(route('admin.users.update', $admin), [
            'first_name' => 'No',
            'last_name' => 'Access',
            'email' => $admin->email,
            'role' => 'teacher',
            'is_admin' => false,
            'password' => '',
        ])
        ->assertSessionHasErrors('is_admin');

    $admin->refresh();
    expect($admin->role)->toBe('admin')
        ->and($admin->is_admin)->toBeTrue();
});
