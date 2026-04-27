<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('handling_methods')) {
            return;
        }

        DB::table('handling_methods')->updateOrInsert(
            ['code' => 'gantry_crane'],
            [
                'name' => 'Gantry crane',
                'category' => 'equipment',
                'requires_equipment' => true,
                'requires_operator' => true,
                'supports_bulk' => false,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'throughput_containers_per_hour' => 45,
                'throughput_tons_per_hour' => 220,
                'notes' => 'Container-focused gantry crane handling for port-side loading and unloading.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        if (!Schema::hasTable('handling_methods')) {
            return;
        }

        DB::table('handling_methods')
            ->where('code', 'gantry_crane')
            ->delete();
    }
};
