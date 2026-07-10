<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            if (! Schema::hasColumn('school_classes', 'sort_order')) {
                $table->unsignedSmallInteger('sort_order')->nullable()->after('academic_year');
            }
        });
    }

    public function down(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            if (Schema::hasColumn('school_classes', 'sort_order')) {
                $table->dropColumn('sort_order');
            }
        });
    }
};
