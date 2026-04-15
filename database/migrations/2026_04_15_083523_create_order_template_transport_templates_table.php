<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_template_transport_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_template_id')->constrained('order_templates')->cascadeOnDelete();
            $table->foreignId('transport_template_id')->constrained('transport_templates')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_template_transport_templates');
    }
};