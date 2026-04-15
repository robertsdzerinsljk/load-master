<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_fuel_stops', function (Blueprint $table) {
            $table->id();

            $table->foreignId('land_route_id')
                ->constrained('land_routes')
                ->cascadeOnDelete();

            $table->foreignId('fuel_station_id')
                ->constrained('fuel_stations')
                ->cascadeOnDelete();

            $table->decimal('distance_from_start_km', 10, 2);
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_fuel_stops');
    }
};