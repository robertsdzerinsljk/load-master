<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_attempt_route_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('simulation_attempt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('land_route_id')->constrained('land_routes')->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->timestamps();

            $table->unique(['simulation_attempt_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_attempt_route_segments');
    }
};