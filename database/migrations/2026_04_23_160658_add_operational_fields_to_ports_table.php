<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ports', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('country')->constrained('locations')->nullOnDelete();

            $table->boolean('supports_bulk')->default(false)->after('loading_rate_tons_per_hour');
            $table->boolean('supports_container')->default(false)->after('supports_bulk');
            $table->boolean('supports_liquid')->default(false)->after('supports_container');
            $table->boolean('supports_refrigerated')->default(false)->after('supports_liquid');
            $table->boolean('supports_hazardous')->default(false)->after('supports_refrigerated');

            $table->boolean('has_crane')->default(false)->after('supports_hazardous');
            $table->boolean('has_forklift')->default(false)->after('has_crane');
            $table->boolean('has_pump')->default(false)->after('has_forklift');
            $table->boolean('has_conveyor')->default(false)->after('has_pump');
        });
    }

    public function down(): void
    {
        Schema::table('ports', function (Blueprint $table) {
            $table->dropForeign(['location_id']);
            $table->dropColumn([
                'location_id',
                'supports_bulk',
                'supports_container',
                'supports_liquid',
                'supports_refrigerated',
                'supports_hazardous',
                'has_crane',
                'has_forklift',
                'has_pump',
                'has_conveyor',
            ]);
        });
    }
};