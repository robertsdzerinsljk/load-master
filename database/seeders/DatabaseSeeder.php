<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            StudentTestUserSeeder::class,
            OfficialSchoolClassSeeder::class,
            LogisticsDemoSeeder::class,
            GlobalLogisticsCatalogSeeder::class,
            DemoUsersAndTasksSeeder::class,
        ]);
    }
}
