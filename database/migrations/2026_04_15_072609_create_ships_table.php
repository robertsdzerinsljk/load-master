<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ships', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('cargo_type')->nullable();
            $table->unsignedInteger('capacity_containers')->nullable();
            $table->decimal('capacity_tons', 12, 2)->nullable();
            $table->decimal('draft_m', 8, 2)->nullable();
            $table->decimal('fuel_consumption_per_hour', 10, 2)->nullable();
            $table->decimal('speed_kmh', 8, 2)->nullable();
            $table->decimal('loading_capacity_containers_per_hour', 10, 2)->nullable();
            $table->decimal('loading_capacity_tons_per_hour', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ships');
    }
};