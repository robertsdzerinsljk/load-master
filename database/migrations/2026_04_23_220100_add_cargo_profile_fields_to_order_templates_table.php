<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            if (!Schema::hasColumn('order_templates', 'cargo_mode')) {
                $table->string('cargo_mode', 40)->nullable();
            }

            if (!Schema::hasColumn('order_templates', 'requires_closed_space')) {
                $table->boolean('requires_closed_space')->default(false);
            }

            if (!Schema::hasColumn('order_templates', 'requires_ventilation')) {
                $table->boolean('requires_ventilation')->default(false);
            }

            if (!Schema::hasColumn('order_templates', 'requires_hazardous_support')) {
                $table->boolean('requires_hazardous_support')->default(false);
            }

            if (!Schema::hasColumn('order_templates', 'allowed_ship_cargo_modes')) {
                $table->json('allowed_ship_cargo_modes')->nullable();
            }

            if (!Schema::hasColumn('order_templates', 'forbidden_ship_cargo_modes')) {
                $table->json('forbidden_ship_cargo_modes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $columns = [
                'cargo_mode',
                'requires_closed_space',
                'requires_ventilation',
                'requires_hazardous_support',
                'allowed_ship_cargo_modes',
                'forbidden_ship_cargo_modes',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('order_templates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
