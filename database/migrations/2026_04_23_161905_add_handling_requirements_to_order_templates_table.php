<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->boolean('requires_loading_method_choice')->default(false)->after('evaluation_mode');
            $table->boolean('requires_unloading_method_choice')->default(false)->after('requires_loading_method_choice');
            $table->boolean('allow_manual_handling')->default(true)->after('requires_unloading_method_choice');
            $table->boolean('allow_port_equipment')->default(true)->after('allow_manual_handling');
            $table->boolean('allow_ship_equipment')->default(true)->after('allow_port_equipment');
            $table->json('allowed_handling_method_codes')->nullable()->after('allow_ship_equipment');
            $table->json('required_handling_method_codes')->nullable()->after('allowed_handling_method_codes');
        });
    }

    public function down(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->dropColumn([
                'requires_loading_method_choice',
                'requires_unloading_method_choice',
                'allow_manual_handling',
                'allow_port_equipment',
                'allow_ship_equipment',
                'allowed_handling_method_codes',
                'required_handling_method_codes',
            ]);
        });
    }
};