<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('route_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('mode')->default('auto');
            $table->decimal('total_distance_km', 12, 2)->nullable();
            $table->decimal('total_duration_hours', 12, 2)->nullable();
            $table->json('geometry_geojson')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('route_template_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_template_id')->constrained('route_templates')->cascadeOnDelete();
            $table->unsignedInteger('sequence');
            $table->string('label', 12);
            $table->foreignId('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('name');
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('point_type')->default('custom');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['route_template_id', 'sequence'], 'route_template_points_sequence_unique');
        });

        Schema::create('route_template_legs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('route_template_id')->constrained('route_templates')->cascadeOnDelete();
            $table->unsignedInteger('sequence');
            $table->string('type')->default('unknown');
            $table->foreignId('origin_point_id')->nullable()->constrained('route_template_points')->nullOnDelete();
            $table->foreignId('destination_point_id')->nullable()->constrained('route_template_points')->nullOnDelete();
            $table->decimal('distance_km', 12, 2)->nullable();
            $table->decimal('duration_hours', 12, 2)->nullable();
            $table->decimal('cost', 12, 2)->nullable();
            $table->string('provider')->nullable();
            $table->json('geometry_geojson')->nullable();
            $table->json('warnings')->nullable();
            $table->json('errors')->nullable();
            $table->timestamps();

            $table->unique(['route_template_id', 'sequence'], 'route_template_legs_sequence_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('route_template_legs');
        Schema::dropIfExists('route_template_points');
        Schema::dropIfExists('route_templates');
    }
};
