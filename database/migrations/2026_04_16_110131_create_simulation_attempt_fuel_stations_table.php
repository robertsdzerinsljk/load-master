<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_attempt_fuel_stations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fuel_station_id')->constrained('fuel_stations')->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->timestamps();

            $table->unique(
                ['simulation_attempt_id', 'position'],
                'sim_attempt_fuel_pos_uq'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_attempt_fuel_stations');
    }
};