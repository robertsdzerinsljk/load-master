<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('handling_methods') || !Schema::hasTable('handling_method_port')) {
            return;
        }

        $gantryCraneId = DB::table('handling_methods')
            ->where('code', 'gantry_crane')
            ->value('id');

        if (!$gantryCraneId) {
            return;
        }

        $now = now();
        $rows = DB::table('ports')
            ->where('has_crane', true)
            ->where('supports_container', true)
            ->pluck('id')
            ->map(fn ($portId) => [
                'handling_method_id' => $gantryCraneId,
                'port_id' => $portId,
                'is_loading' => true,
                'is_unloading' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->all();

        if (!empty($rows)) {
            DB::table('handling_method_port')->insertOrIgnore($rows);
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('handling_methods') || !Schema::hasTable('handling_method_port')) {
            return;
        }

        $gantryCraneId = DB::table('handling_methods')
            ->where('code', 'gantry_crane')
            ->value('id');

        if (!$gantryCraneId) {
            return;
        }

        DB::table('handling_method_port')
            ->where('handling_method_id', $gantryCraneId)
            ->delete();
    }
};
