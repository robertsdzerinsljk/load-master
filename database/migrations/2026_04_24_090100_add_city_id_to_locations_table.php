<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('locations') || !Schema::hasTable('cities')) {
            return;
        }

        if (!Schema::hasColumn('locations', 'city_id')) {
            Schema::table('locations', function (Blueprint $table) {
                $table->foreignId('city_id')
                    ->nullable()
                    ->after('country')
                    ->constrained('cities')
                    ->nullOnDelete();
            });
        }

        $locations = DB::table('locations')
            ->select('id', 'city', 'country')
            ->whereNotNull('city')
            ->orderBy('id')
            ->get();

        foreach ($locations as $location) {
            $name = trim((string) $location->city);

            if ($name === '') {
                continue;
            }

            $country = trim((string) ($location->country ?? ''));
            $country = $country !== '' ? $country : null;

            $query = DB::table('cities')->where('name', $name);
            $country === null
                ? $query->whereNull('country')
                : $query->where('country', $country);

            $cityId = $query->value('id');

            if (!$cityId) {
                $cityId = DB::table('cities')->insertGetId([
                    'name' => $name,
                    'country' => $country,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('locations')
                ->where('id', $location->id)
                ->update(['city_id' => $cityId]);
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('locations') || !Schema::hasColumn('locations', 'city_id')) {
            return;
        }

        Schema::table('locations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('city_id');
        });
    }
};
