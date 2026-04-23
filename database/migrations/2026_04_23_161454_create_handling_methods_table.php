<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('handling_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('category')->nullable(); // loading, unloading, transfer
            $table->boolean('requires_equipment')->default(false);
            $table->boolean('requires_operator')->default(false);
            $table->boolean('supports_bulk')->default(false);
            $table->boolean('supports_container')->default(false);
            $table->boolean('supports_liquid')->default(false);
            $table->boolean('supports_refrigerated')->default(false);
            $table->boolean('supports_hazardous')->default(false);
            $table->decimal('throughput_containers_per_hour', 10, 2)->nullable();
            $table->decimal('throughput_tons_per_hour', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('handling_methods');
    }
};