<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_templates', function (Blueprint $table) {
            $table->id();

            $table->string('title');
            $table->string('scenario_type')->default('land_transport');
            $table->string('status')->default('draft');

            $table->text('description')->nullable();
            $table->text('student_brief')->nullable();
            $table->text('teacher_notes')->nullable();

            $table->string('cargo_name')->nullable();
            $table->string('cargo_type')->nullable();
            $table->unsignedInteger('cargo_amount_containers')->nullable();
            $table->decimal('cargo_amount_tons', 12, 2)->nullable();
            $table->decimal('cargo_volume_m3', 12, 2)->nullable();
            $table->decimal('cargo_value', 12, 2)->nullable();

            $table->foreignId('temperature_mode_id')->nullable()->constrained('temperature_modes')->nullOnDelete();
            $table->foreignId('special_condition_id')->nullable()->constrained('special_conditions')->nullOnDelete();

            $table->foreignId('start_location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->foreignId('end_location_id')->nullable()->constrained('locations')->nullOnDelete();

            $table->foreignId('start_port_id')->nullable()->constrained('ports')->nullOnDelete();
            $table->foreignId('end_port_id')->nullable()->constrained('ports')->nullOnDelete();

            $table->date('deadline_date')->nullable();
            $table->decimal('budget_limit', 12, 2)->nullable();

            $table->boolean('requires_refuel_planning')->default(false);
            $table->unsignedInteger('max_trips')->nullable();

            $table->string('priority')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_templates');
    }
};