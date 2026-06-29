<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('land_routes', function (Blueprint $table) {
            if (! Schema::hasColumn('land_routes', 'geometry_geojson')) {
                $table->json('geometry_geojson')->nullable()->after('toll_cost');
            }

            if (! Schema::hasColumn('land_routes', 'provider')) {
                $table->string('provider')->nullable()->after('geometry_geojson');
            }
        });
    }

    public function down(): void
    {
        Schema::table('land_routes', function (Blueprint $table) {
            if (Schema::hasColumn('land_routes', 'provider')) {
                $table->dropColumn('provider');
            }

            if (Schema::hasColumn('land_routes', 'geometry_geojson')) {
                $table->dropColumn('geometry_geojson');
            }
        });
    }
};
