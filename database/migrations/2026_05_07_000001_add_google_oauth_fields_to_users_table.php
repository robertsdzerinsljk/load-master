<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('google_avatar')->nullable()->after('google_id');
            $table->timestamp('google_linked_at')->nullable()->after('google_avatar');
            $table->string('external_user_id')->nullable()->index()->after('google_linked_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
            $table->dropIndex(['external_user_id']);
            $table->dropColumn([
                'google_id',
                'google_avatar',
                'google_linked_at',
                'external_user_id',
            ]);
        });
    }
};
