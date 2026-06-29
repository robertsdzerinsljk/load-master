<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            if (! Schema::hasColumn('locations', 'source')) {
                $table->string('source')->nullable()->after('longitude');
            }

            if (! Schema::hasColumn('locations', 'external_id')) {
                $table->string('external_id')->nullable()->after('source');
            }

            if (! Schema::hasColumn('locations', 'metadata')) {
                $table->json('metadata')->nullable()->after('external_id');
            }
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->index(['source', 'external_id'], 'locations_source_external_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropIndex('locations_source_external_id_index');
            $table->dropColumn(['source', 'external_id', 'metadata']);
        });
    }
};
