<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('simulation_attempt_fuel_stations')) {
            Schema::create('simulation_attempt_fuel_stations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('simulation_attempt_id')->constrained()->cascadeOnDelete();
                $table->foreignId('fuel_station_id')->constrained('fuel_stations')->cascadeOnDelete();
                $table->unsignedInteger('position');
                $table->timestamps();
            });
        }

        $indexExists = false;

        try {
            $driver = DB::getDriverName();

            if ($driver === 'mysql') {
                $indexes = DB::select("SHOW INDEX FROM simulation_attempt_fuel_stations WHERE Key_name = 'sim_attempt_fuel_pos_uq'");
                $indexExists = !empty($indexes);
            } elseif ($driver === 'sqlite') {
                $indexes = DB::select("PRAGMA index_list('simulation_attempt_fuel_stations')");
                foreach ($indexes as $index) {
                    if (($index->name ?? null) === 'sim_attempt_fuel_pos_uq') {
                        $indexExists = true;
                        break;
                    }
                }
            }
        } catch (\Throwable $e) {
            $indexExists = false;
        }

        if (!$indexExists) {
            try {
                Schema::table('simulation_attempt_fuel_stations', function (Blueprint $table) {
                    $table->unique(
                        ['simulation_attempt_id', 'position'],
                        'sim_attempt_fuel_pos_uq'
                    );
                });
            } catch (\Throwable $e) {
                // ignore if index already exists or table state is partially repaired
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_attempt_fuel_stations');
    }
};