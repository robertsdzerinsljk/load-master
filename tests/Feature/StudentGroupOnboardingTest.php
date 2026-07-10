<?php

use App\Models\SchoolClass;
use App\Models\User;
use Database\Seeders\OfficialSchoolClassSeeder;
use Database\Seeders\StudentTestUserSeeder;

test('student can choose academic year and group', function () {
    $student = User::factory()->create([
        'role' => 'student',
        'class_id' => null,
    ]);
    $teacher = User::factory()->create(['role' => 'teacher']);
    $class = SchoolClass::query()->create([
        'teacher_id' => $teacher->id,
        'name' => 'Loģistika LT-2A',
        'code' => 'LT-2A',
        'academic_year' => '2026/2027',
    ]);

    $this->actingAs($student)
        ->get(route('student.dashboard'))
        ->assertRedirect(route('onboarding.student-group'));

    $this->actingAs($student)
        ->post(route('onboarding.student-group.update'), [
            'academic_year' => '2026/2027',
            'class_id' => $class->id,
        ])
        ->assertRedirect(route('student.dashboard'));

    expect($student->refresh()->class_id)->toBe($class->id);
});

test('onboarding uses official school class list for the academic year', function () {
    $this->seed(StudentTestUserSeeder::class);

    $teacher = User::query()->where('email', 'teacher@test.local')->firstOrFail();
    SchoolClass::query()->create([
        'teacher_id' => $teacher->id,
        'name' => 'Old demo group',
        'code' => 'LT-2A',
        'academic_year' => '2026/2027',
    ]);

    $this->seed(OfficialSchoolClassSeeder::class);

    $officialCodes = [
        'M-11',
        'M-12',
        'M-21',
        'M-31',
        'M-41',
        'S-11',
        'S-12',
        'S-21',
        'S-22',
        'S-31',
        'S-32',
        'S-41',
        'APM_I',
        'APV_I',
        'AVM_I',
        'AVV_I',
        'L-11A',
        'L-21A',
        'LS_II',
        'M-21A',
        'M-31A',
        'M-51A',
        'M-61A',
        'S-11A',
        'S-21A',
        'S-31A',
        'S-51A',
        'S-61A',
        'APM_II',
        'APV_II',
        'AVM_II',
        'AVM_IV',
        'AVV_II',
        'AVV_IV',
        'LS_III',
        'APM_III',
        'APV_III',
        'AVM_III',
        'AVV_III',
        '51 BT',
    ];

    $codes = SchoolClass::query()
        ->where('academic_year', '2026/2027')
        ->pluck('code')
        ->all();

    expect($codes)->toContain(...$officialCodes)
        ->and(SchoolClass::query()->where('academic_year', '2022/2023')->count())->toBe(40)
        ->and(SchoolClass::query()->where('academic_year', '2023/2024')->count())->toBe(40)
        ->and(SchoolClass::query()->where('academic_year', '2024/2025')->count())->toBe(40)
        ->and(SchoolClass::query()->where('academic_year', '2025/2026')->count())->toBe(40)
        ->and(SchoolClass::query()->where('academic_year', '2026/2027')->count())->toBe(40)
        ->and(SchoolClass::query()->where('code', 'LT-2A')->exists())->toBeFalse()
        ->and(SchoolClass::query()->where('code', 'LT-3B')->exists())->toBeFalse();
});
