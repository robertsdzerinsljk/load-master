<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            if (! Schema::hasColumn('school_classes', 'academic_year')) {
                $table->string('academic_year')->nullable()->after('code');
            }
        });

        DB::table('school_classes')
            ->whereNull('academic_year')
            ->update(['academic_year' => '2026/2027']);
    }

    public function down(): void
    {
        Schema::table('school_classes', function (Blueprint $table) {
            if (Schema::hasColumn('school_classes', 'academic_year')) {
                $table->dropColumn('academic_year');
            }
        });
    }
};
