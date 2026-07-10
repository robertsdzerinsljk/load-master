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
            ['email' => 'admin@test.local'],
            [
                'name' => 'Test Admin',
                'first_name' => 'Test',
                'last_name' => 'Admin',
                'role' => 'admin',
                'is_admin' => true,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'student@test.local'],
            [
                'name' => 'Test Student',
                'first_name' => 'Test',
                'last_name' => 'Student',
                'role' => 'student',
                'is_admin' => false,
                'password' => Hash::make('password'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'teacher@test.local'],
            [
                'name' => 'Test Teacher',
                'first_name' => 'Test',
                'last_name' => 'Teacher',
                'role' => 'teacher',
                'is_admin' => false,
                'password' => Hash::make('password'),
            ]
        );
    }
}
