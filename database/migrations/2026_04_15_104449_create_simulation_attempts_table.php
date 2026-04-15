<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('simulation_attempts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_template_id')
                ->constrained('order_templates')
                ->cascadeOnDelete();

    $table->foreignId('user_id')
        ->constrained('users')
        ->cascadeOnDelete();

            $table->string('status')->default('in_progress');
            $table->string('current_step')->default('intro');

            $table->foreignId('selected_transport_template_id')
                ->nullable()
                ->constrained('transport_templates')
                ->nullOnDelete();

            $table->foreignId('selected_land_route_id')
                ->nullable()
                ->constrained('land_routes')
                ->nullOnDelete();

            $table->foreignId('selected_fuel_station_id')
                ->nullable()
                ->constrained('fuel_stations')
                ->nullOnDelete();

            $table->unsignedInteger('selected_vehicle_count')->nullable();

            $table->json('preview_result')->nullable();
            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('simulation_attempts');
    }
};