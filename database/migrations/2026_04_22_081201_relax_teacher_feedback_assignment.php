<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $foreignKeys = DB::select("
            SELECT CONSTRAINT_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'teacher_feedback'
            AND COLUMN_NAME = 'assignment_id'
            AND CONSTRAINT_SCHEMA = DATABASE()
        ");

        foreach ($foreignKeys as $fk) {
            DB::statement("ALTER TABLE teacher_feedback DROP FOREIGN KEY {$fk->CONSTRAINT_NAME}");
        }

        Schema::table('teacher_feedback', function (Blueprint $table) {
            $table->unsignedBigInteger('assignment_id')->nullable()->change();
        });

        Schema::table('teacher_feedback', function (Blueprint $table) {
            $table->foreign('assignment_id')
                ->references('id')
                ->on('assignments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        $fallbackAssignmentId = DB::table('assignments')->min('id');

        if ($fallbackAssignmentId === null) {
            throw new RuntimeException('Rollback nav iespējams: tabulā assignments nav neviena ieraksta.');
        }

        DB::table('teacher_feedback')
            ->whereNull('assignment_id')
            ->update([
                'assignment_id' => $fallbackAssignmentId,
            ]);

        Schema::table('teacher_feedback', function (Blueprint $table) {
            $table->dropForeign(['assignment_id']);
        });

        Schema::table('teacher_feedback', function (Blueprint $table) {
            $table->unsignedBigInteger('assignment_id')->nullable(false)->change();
        });

        Schema::table('teacher_feedback', function (Blueprint $table) {
            $table->foreign('assignment_id')
                ->references('id')
                ->on('assignments')
                ->cascadeOnDelete();
        });
    }
};