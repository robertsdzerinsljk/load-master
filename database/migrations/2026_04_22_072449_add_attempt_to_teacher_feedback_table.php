<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_feedback', function (Blueprint $table) {
            $table->unsignedBigInteger('simulation_attempt_id')->nullable()->after('id');

            if (!Schema::hasColumn('teacher_feedback', 'grade')) {
                $table->integer('grade')->nullable()->after('simulation_attempt_id');
            }

            if (!Schema::hasColumn('teacher_feedback', 'comment')) {
                $table->text('comment')->nullable()->after('grade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('teacher_feedback', function (Blueprint $table) {
            if (Schema::hasColumn('teacher_feedback', 'simulation_attempt_id')) {
                $table->dropColumn('simulation_attempt_id');
            }

            if (Schema::hasColumn('teacher_feedback', 'grade')) {
                $table->dropColumn('grade');
            }

            if (Schema::hasColumn('teacher_feedback', 'comment')) {
                $table->dropColumn('comment');
            }
        });
    }
};