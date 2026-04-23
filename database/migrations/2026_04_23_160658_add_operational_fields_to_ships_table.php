<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ships', function (Blueprint $table) {
            $table->string('cargo_mode')->nullable()->after('cargo_type');

            $table->boolean('is_open_cargo')->default(false)->after('cargo_mode');
            $table->boolean('is_closed_cargo')->default(false)->after('is_open_cargo');

            $table->boolean('supports_bulk')->default(false)->after('is_closed_cargo');
            $table->boolean('supports_container')->default(false)->after('supports_bulk');
            $table->boolean('supports_liquid')->default(false)->after('supports_container');
            $table->boolean('supports_refrigerated')->default(false)->after('supports_liquid');
            $table->boolean('supports_hazardous')->default(false)->after('supports_refrigerated');

            $table->boolean('has_onboard_crane')->default(false)->after('supports_hazardous');
        });
    }

    public function down(): void
    {
        Schema::table('ships', function (Blueprint $table) {
            $table->dropColumn([
                'cargo_mode',
                'is_open_cargo',
                'is_closed_cargo',
                'supports_bulk',
                'supports_container',
                'supports_liquid',
                'supports_refrigerated',
                'supports_hazardous',
                'has_onboard_crane',
            ]);
        });
    }
};