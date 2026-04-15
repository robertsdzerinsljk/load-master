<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ports', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('country');
            $table->decimal('max_draft_m', 8, 2)->nullable();
            $table->decimal('city_distance_km', 8, 2)->nullable();
            $table->decimal('loading_rate_containers_per_hour', 10, 2)->nullable();
            $table->decimal('loading_rate_tons_per_hour', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ports');
    }
};