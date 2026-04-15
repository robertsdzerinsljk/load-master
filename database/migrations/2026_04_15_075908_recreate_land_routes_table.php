<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('land_routes');

        Schema::create('land_routes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('from_location_id')
                ->constrained('locations')
                ->cascadeOnDelete();

            $table->foreignId('to_location_id')
                ->constrained('locations')
                ->cascadeOnDelete();

            $table->decimal('distance_km', 10, 2);
            $table->decimal('estimated_time_hours', 10, 2)->nullable();
            $table->decimal('toll_cost', 10, 2)->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('land_routes');
    }
};