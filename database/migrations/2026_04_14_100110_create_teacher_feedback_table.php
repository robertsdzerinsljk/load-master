<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_feedback', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->unsignedBigInteger('teacher_id')->nullable();

            $table->text('feedback_text')->nullable();
            $table->enum('decision', ['approved', 'rejected', 'needs_revision'])->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_feedback');
    }
};