<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('simulation_attempts', function (Blueprint $table) {
            if (!Schema::hasColumn('simulation_attempts', 'selected_port_id')) {
                $table->foreignId('selected_port_id')
                    ->nullable()
                    ->constrained('ports')
                    ->nullOnDelete();
            }

            if (!Schema::hasColumn('simulation_attempts', 'selected_ship_id')) {
                $table->foreignId('selected_ship_id')
                    ->nullable()
                    ->constrained('ships')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('simulation_attempts', function (Blueprint $table) {
            if (Schema::hasColumn('simulation_attempts', 'selected_port_id')) {
                $table->dropConstrainedForeignId('selected_port_id');
            }

            if (Schema::hasColumn('simulation_attempts', 'selected_ship_id')) {
                $table->dropConstrainedForeignId('selected_ship_id');
            }
        });
    }
};