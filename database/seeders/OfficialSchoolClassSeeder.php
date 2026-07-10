<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OfficialSchoolClassSeeder extends Seeder
{
    private const ACADEMIC_YEARS = [
        '2022/2023',
        '2023/2024',
        '2024/2025',
        '2025/2026',
        '2026/2027',
    ];

    private const OFFICIAL_CODES = [
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

    private const OLD_DEMO_CODES = [
        'LT-2A',
        'LT-3B',
    ];

    public function run(): void
    {
        $teacher = $this->defaultTeacher();

        foreach (self::ACADEMIC_YEARS as $academicYear) {
            foreach (self::OFFICIAL_CODES as $index => $code) {
                SchoolClass::query()->updateOrCreate(
                    [
                        'code' => $code,
                        'academic_year' => $academicYear,
                    ],
                    [
                        'teacher_id' => $teacher->id,
                        'name' => $code,
                        'sort_order' => $index + 1,
                        'description' => 'Official LoadMaster onboarding group.',
                    ],
                );
            }
        }

        SchoolClass::query()
            ->whereIn('code', self::OLD_DEMO_CODES)
            ->delete();
    }

    private function defaultTeacher(): User
    {
        return User::query()->firstOrCreate(
            ['email' => 'teacher@test.local'],
            [
                'name' => 'Test Teacher',
                'first_name' => 'Test',
                'last_name' => 'Teacher',
                'role' => 'teacher',
                'is_admin' => false,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );
    }
}
