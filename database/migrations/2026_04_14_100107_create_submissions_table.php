<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->unsignedBigInteger('student_id')->nullable();

            $table->foreignId('selected_transport_template_id')->nullable()->constrained('transport_templates')->nullOnDelete();
            $table->foreignId('selected_temperature_mode_id')->nullable()->constrained('temperature_modes')->nullOnDelete();
            $table->foreignId('selected_special_condition_id')->nullable()->constrained('special_conditions')->nullOnDelete();
            $table->foreignId('selected_customs_document_id')->nullable()->constrained('customs_documents')->nullOnDelete();

            $table->text('route_plan')->nullable();
            $table->text('delivery_notes')->nullable();

            $table->boolean('validation_quantity_match')->nullable();
            $table->boolean('validation_type_match')->nullable();
            $table->boolean('validation_quality_match')->nullable();

            $table->text('student_note')->nullable();
            $table->timestamp('submitted_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};