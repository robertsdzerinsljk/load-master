<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentTestUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'student@test.local'],
            [
                'name' => 'Test Student',
                'role' => 'student',
                'password' => Hash::make('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'teacher@test.local'],
            [
                'name' => 'Test Teacher',
                'role' => 'teacher',
                'password' => Hash::make('password'),
            ]
        );
    }
}
