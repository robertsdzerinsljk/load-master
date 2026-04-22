<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('PRAGMA foreign_keys=OFF');

        Schema::table('teacher_feedback', function (Blueprint $table) {
            $table->dropForeign(['assignment_id']);
        });

        DB::statement('CREATE TABLE teacher_feedback_tmp (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            assignment_id INTEGER NULL,
            simulation_attempt_id INTEGER NULL,
            grade INTEGER NULL,
            comment TEXT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
            FOREIGN KEY (simulation_attempt_id) REFERENCES simulation_attempts(id) ON DELETE CASCADE
        )');

        DB::statement('INSERT INTO teacher_feedback_tmp (id, assignment_id, simulation_attempt_id, grade, comment, created_at, updated_at)
            SELECT id, assignment_id, simulation_attempt_id, grade, comment, created_at, updated_at
            FROM teacher_feedback');

        Schema::drop('teacher_feedback');
        DB::statement('ALTER TABLE teacher_feedback_tmp RENAME TO teacher_feedback');

        DB::statement('PRAGMA foreign_keys=ON');
    }

    public function down(): void
    {
        DB::statement('PRAGMA foreign_keys=OFF');

        DB::statement('CREATE TABLE teacher_feedback_tmp (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            assignment_id INTEGER NOT NULL,
            simulation_attempt_id INTEGER NULL,
            grade INTEGER NULL,
            comment TEXT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
            FOREIGN KEY (simulation_attempt_id) REFERENCES simulation_attempts(id) ON DELETE CASCADE
        )');

        DB::statement('INSERT INTO teacher_feedback_tmp (id, assignment_id, simulation_attempt_id, grade, comment, created_at, updated_at)
            SELECT id, COALESCE(assignment_id, 1), simulation_attempt_id, grade, comment, created_at, updated_at
            FROM teacher_feedback');

        Schema::drop('teacher_feedback');
        DB::statement('ALTER TABLE teacher_feedback_tmp RENAME TO teacher_feedback');

        DB::statement('PRAGMA foreign_keys=ON');
    }
};
