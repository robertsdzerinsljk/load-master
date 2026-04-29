<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
        });

        DB::table('users')
            ->select(['id', 'name'])
            ->orderBy('id')
            ->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    $name = trim((string) $user->name);
                    $firstName = $name;
                    $lastName = null;

                    if (Str::contains($name, ' ')) {
                        [$firstName, $lastName] = explode(' ', $name, 2);
                    }

                    DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'first_name' => $firstName ?: null,
                            'last_name' => $lastName ? trim($lastName) : null,
                        ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['first_name', 'last_name']);
        });
    }
};
