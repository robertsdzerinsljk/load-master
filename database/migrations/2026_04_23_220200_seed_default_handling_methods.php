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

        $now = now();

        $definitions = [
            [
                'name' => 'Crane',
                'code' => 'crane',
                'category' => 'equipment',
                'requires_equipment' => true,
                'requires_operator' => true,
                'supports_bulk' => true,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => true,
                'throughput_containers_per_hour' => 30,
                'throughput_tons_per_hour' => 180,
                'notes' => 'General-purpose crane handling for container and break-bulk cargo.',
            ],
            [
                'name' => 'Gantry crane',
                'code' => 'gantry_crane',
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
            ],
            [
                'name' => 'Conveyor',
                'code' => 'conveyor',
                'category' => 'equipment',
                'requires_equipment' => true,
                'requires_operator' => false,
                'supports_bulk' => true,
                'supports_container' => false,
                'supports_liquid' => false,
                'supports_refrigerated' => false,
                'supports_hazardous' => false,
                'throughput_containers_per_hour' => null,
                'throughput_tons_per_hour' => 420,
                'notes' => 'High-throughput handling for dry bulk cargo.',
            ],
            [
                'name' => 'Forklift',
                'code' => 'forklift',
                'category' => 'equipment',
                'requires_equipment' => true,
                'requires_operator' => true,
                'supports_bulk' => false,
                'supports_container' => true,
                'supports_liquid' => false,
                'supports_refrigerated' => true,
                'supports_hazardous' => false,
                'throughput_containers_per_hour' => 18,
                'throughput_tons_per_hour' => 65,
                'notes' => 'Flexible handling for pallets, packaged cargo, and mixed units.',
            ],
            [
                'name' => 'Manual',
                'code' => 'manual',
                'category' => 'manual',
                'requires_equipment' => false,
                'requires_operator' => false,
                'supports_bulk' => false,
                'supports_container' => false,
                'supports_liquid' => false,
                'supports_refrigerated' => false,
                'supports_hazardous' => false,
                'throughput_containers_per_hour' => 4,
                'throughput_tons_per_hour' => 12,
                'notes' => 'Fallback manual handling for small or irregular loads.',
            ],
            [
                'name' => 'Pump',
                'code' => 'pump',
                'category' => 'equipment',
                'requires_equipment' => true,
                'requires_operator' => true,
                'supports_bulk' => false,
                'supports_container' => false,
                'supports_liquid' => true,
                'supports_refrigerated' => false,
                'supports_hazardous' => true,
                'throughput_containers_per_hour' => null,
                'throughput_tons_per_hour' => 260,
                'notes' => 'Liquid cargo transfer via port or vessel pumping systems.',
            ],
        ];

        foreach ($definitions as $definition) {
            $exists = DB::table('handling_methods')
                ->where('code', $definition['code'])
                ->exists();

            if ($exists) {
                continue;
            }

            DB::table('handling_methods')->insert([
                ...$definition,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('handling_methods')) {
            return;
        }

        DB::table('handling_methods')
            ->whereIn('code', ['crane', 'gantry_crane', 'conveyor', 'forklift', 'manual', 'pump'])
            ->delete();
    }
};
