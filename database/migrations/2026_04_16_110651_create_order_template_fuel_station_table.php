<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('order_template_fuel_station')) {
            Schema::create('order_template_fuel_station', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_template_id')->constrained()->cascadeOnDelete();
                $table->foreignId('fuel_station_id')->constrained()->cascadeOnDelete();
                $table->timestamps();
            });
        }

        $indexExists = false;

        try {
            $driver = DB::getDriverName();

            if ($driver === 'mysql') {
                $indexes = DB::select("SHOW INDEX FROM order_template_fuel_station WHERE Key_name = 'ord_tpl_fuel_uq'");
                $indexExists = !empty($indexes);
            } elseif ($driver === 'sqlite') {
                $indexes = DB::select("PRAGMA index_list('order_template_fuel_station')");
                foreach ($indexes as $index) {
                    if (($index->name ?? null) === 'ord_tpl_fuel_uq') {
                        $indexExists = true;
                        break;
                    }
                }
            }
        } catch (\Throwable $e) {
            $indexExists = false;
        }

        if (!$indexExists) {
            try {
                Schema::table('order_template_fuel_station', function (Blueprint $table) {
                    $table->unique(
                        ['order_template_id', 'fuel_station_id'],
                        'ord_tpl_fuel_uq'
                    );
                });
            } catch (\Throwable $e) {
                // ignore if index already exists or table is partially repaired
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_template_fuel_station');
    }
};