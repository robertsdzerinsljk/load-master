<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('order_template_id')->nullable();

            $table->unsignedBigInteger('assigned_by')->nullable();

            $table->unsignedBigInteger('student_id')->nullable();
            $table->foreignId('group_id')->nullable()->constrained('student_groups')->nullOnDelete();

            $table->enum('assignment_type', ['student', 'group']);
            $table->enum('status', ['not_started', 'in_progress', 'submitted', 'reviewed', 'overdue'])->default('not_started');

            $table->timestamp('assigned_at')->nullable();
            $table->date('deadline')->nullable();
            $table->text('teacher_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignments');
    }
};