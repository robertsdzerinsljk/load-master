<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('handling_method_ship', function (Blueprint $table) {
            $table->id();
            $table->foreignId('handling_method_id')->constrained()->cascadeOnDelete();
            $table->foreignId('ship_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_loading')->default(true);
            $table->boolean('is_unloading')->default(true);
            $table->decimal('throughput_override_containers_per_hour', 10, 2)->nullable();
            $table->decimal('throughput_override_tons_per_hour', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['handling_method_id', 'ship_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('handling_method_ship');
    }
};