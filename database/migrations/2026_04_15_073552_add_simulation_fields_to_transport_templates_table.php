<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transport_templates', function (Blueprint $table) {
            $table->string('type')->nullable()->after('name');
            $table->unsignedInteger('capacity_containers')->nullable()->after('capacity');
            $table->decimal('capacity_tons', 10, 2)->nullable()->after('capacity_containers');
            $table->decimal('avg_speed_kmh', 8, 2)->nullable()->after('capacity_tons');
            $table->decimal('cost_per_km', 10, 2)->nullable()->after('avg_speed_kmh');
            $table->decimal('fuel_consumption_per_100km', 10, 2)->nullable()->after('cost_per_km');
            $table->decimal('max_range_km', 10, 2)->nullable()->after('fuel_consumption_per_100km');
            $table->unsignedInteger('loading_time_minutes')->nullable()->after('max_range_km');
            $table->unsignedInteger('unloading_time_minutes')->nullable()->after('loading_time_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('transport_templates', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'capacity_containers',
                'capacity_tons',
                'avg_speed_kmh',
                'cost_per_km',
                'fuel_consumption_per_100km',
                'max_range_km',
                'loading_time_minutes',
                'unloading_time_minutes',
            ]);
        });
    }
};