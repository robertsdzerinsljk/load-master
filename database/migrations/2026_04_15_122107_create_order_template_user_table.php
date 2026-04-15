<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_template_user', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_template_id')
                ->constrained('order_templates')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->timestamp('assigned_at')->nullable();

            $table->timestamps();

            $table->unique(['order_template_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_template_user');
    }
};