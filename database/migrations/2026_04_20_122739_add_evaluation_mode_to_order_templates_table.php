<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->string('evaluation_mode', 30)
                ->default('practice')
                ->after('scenario_focus');
        });
    }

    public function down(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->dropColumn('evaluation_mode');
        });
    }
};