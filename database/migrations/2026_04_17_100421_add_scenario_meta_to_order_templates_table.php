<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->string('scenario_focus')->nullable()->after('scenario_type');
            $table->json('step_config')->nullable()->after('priority');
            $table->json('scenario_config')->nullable()->after('step_config');
        });
    }

    public function down(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->dropColumn([
                'scenario_focus',
                'step_config',
                'scenario_config',
            ]);
        });
    }
};