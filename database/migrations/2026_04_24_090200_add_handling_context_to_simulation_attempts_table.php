<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('simulation_attempts') || Schema::hasColumn('simulation_attempts', 'handling_context')) {
            return;
        }

        Schema::table('simulation_attempts', function (Blueprint $table) {
            $table->json('handling_context')->nullable()->after('preview_result');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('simulation_attempts') || !Schema::hasColumn('simulation_attempts', 'handling_context')) {
            return;
        }

        Schema::table('simulation_attempts', function (Blueprint $table) {
            $table->dropColumn('handling_context');
        });
    }
};
