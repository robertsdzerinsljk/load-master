<?php

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as GoogleUser;

function fakeGoogleUser(string $email, string $id = 'google-id'): GoogleUser
{
    return (new GoogleUser)
        ->setRaw([
            'given_name' => 'Google',
            'family_name' => 'User',
            'email_verified' => true,
        ])
        ->map([
            'id' => $id,
            'name' => 'Google User',
            'email' => $email,
            'avatar' => null,
        ]);
}

function mockGoogleCallbackUser(GoogleUser $googleUser): void
{
    $provider = Mockery::mock();
    $provider->shouldReceive('user')->once()->andReturn($googleUser);

    Socialite::shouldReceive('driver')
        ->once()
        ->with('google')
        ->andReturn($provider);
}

beforeEach(function () {
    config([
        'services.google.allowed_domains' => ['ljk.lv', 'ljkstudents.lv'],
        'services.google.http_verify' => null,
    ]);
});

test('google users from ljk staff domain are teachers by default', function () {
    mockGoogleCallbackUser(fakeGoogleUser('teacher.person@ljk.lv', 'staff-google-id'));

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('dashboard'));

    $user = User::query()->where('email', 'teacher.person@ljk.lv')->firstOrFail();

    expect($user->role)->toBe('teacher')
        ->and($user->class_id)->toBeNull()
        ->and($user->google_id)->toBe('staff-google-id');
});

test('google users from student domain are students and continue to onboarding', function () {
    mockGoogleCallbackUser(fakeGoogleUser('student.person@ljkstudents.lv', 'student-google-id'));

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('dashboard'));

    $user = User::query()->where('email', 'student.person@ljkstudents.lv')->firstOrFail();

    expect($user->role)->toBe('student')
        ->and($user->class_id)->toBeNull();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertRedirect(route('onboarding.student-group'));
});

test('existing staff domain students are promoted to teacher on next google login', function () {
    $existing = User::factory()->create([
        'email' => 'existing.staff@ljk.lv',
        'role' => 'student',
        'class_id' => null,
    ]);

    mockGoogleCallbackUser(fakeGoogleUser('existing.staff@ljk.lv', 'existing-staff-google-id'));

    $this->get(route('auth.google.callback'))
        ->assertRedirect(route('dashboard'));

    $existing->refresh();

    expect($existing->role)->toBe('teacher')
        ->and($existing->class_id)->toBeNull()
        ->and($existing->google_id)->toBe('existing-staff-google-id');
});
