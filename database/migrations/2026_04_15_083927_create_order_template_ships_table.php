<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_template_ships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_template_id')->constrained('order_templates')->cascadeOnDelete();
            $table->foreignId('ship_id')->constrained('ships')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_template_ships');
    }
};