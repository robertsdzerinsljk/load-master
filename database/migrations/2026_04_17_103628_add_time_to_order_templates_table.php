<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->dateTime('scenario_start_at')->nullable()->after('deadline_date');
            $table->dateTime('deadline_at')->nullable()->after('scenario_start_at');
        });
    }

    public function down(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->dropColumn([
                'scenario_start_at',
                'deadline_at',
            ]);
        });
    }
};