<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('simulation_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('simulation_attempts', 'preview_result')) {
                $table->json('preview_result')->nullable()->after('status');
            }

            if (!Schema::hasColumn('simulation_attempts', 'score')) {
                $table->unsignedInteger('score')->nullable()->after('preview_result');
            }

            if (!Schema::hasColumn('simulation_attempts', 'total_cost')) {
                $table->decimal('total_cost', 12, 2)->nullable()->after('score');
            }

            if (!Schema::hasColumn('simulation_attempts', 'total_time_hours')) {
                $table->decimal('total_time_hours', 10, 2)->nullable()->after('total_cost');
            }

            if (!Schema::hasColumn('simulation_attempts', 'total_fuel_liters')) {
                $table->decimal('total_fuel_liters', 10, 2)->nullable()->after('total_time_hours');
            }

            if (!Schema::hasColumn('simulation_attempts', 'is_valid')) {
                $table->boolean('is_valid')->default(false)->after('total_fuel_liters');
            }

            if (!Schema::hasColumn('simulation_attempts', 'feedback_text')) {
                $table->text('feedback_text')->nullable()->after('is_valid');
            }

            if (!Schema::hasColumn('simulation_attempts', 'submitted_at')) {
                $table->timestamp('submitted_at')->nullable()->after('feedback_text');
            }
        });
    }

    public function down(): void
    {
        Schema::table('simulation_attempts', function (Blueprint $table) {
            $columns = [
                'preview_result',
                'score',
                'total_cost',
                'total_time_hours',
                'total_fuel_liters',
                'is_valid',
                'feedback_text',
                'submitted_at',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('simulation_attempts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};