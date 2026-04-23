<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('simulation_attempts', function (Blueprint $table) {
            $table->string('selected_loading_method_code')->nullable()->after('selected_ship_id');
            $table->string('selected_unloading_method_code')->nullable()->after('selected_loading_method_code');

            $table->string('loading_method_source')->nullable()->after('selected_unloading_method_code');
            $table->string('unloading_method_source')->nullable()->after('loading_method_source');

            $table->decimal('loading_duration_minutes', 10, 2)->nullable()->after('unloading_method_source');
            $table->decimal('unloading_duration_minutes', 10, 2)->nullable()->after('loading_duration_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('simulation_attempts', function (Blueprint $table) {
            $table->dropColumn([
                'selected_loading_method_code',
                'selected_unloading_method_code',
                'loading_method_source',
                'unloading_method_source',
                'loading_duration_minutes',
                'unloading_duration_minutes',
            ]);
        });
    }
};