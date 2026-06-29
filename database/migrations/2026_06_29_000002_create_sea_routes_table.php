<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sea_routes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('origin_port_id')->constrained('ports')->cascadeOnDelete();
            $table->foreignId('destination_port_id')->constrained('ports')->cascadeOnDelete();
            $table->decimal('distance_km', 10, 2)->nullable();
            $table->decimal('distance_nm', 10, 2)->nullable();
            $table->decimal('duration_hours', 10, 2)->nullable();
            $table->json('geometry_geojson')->nullable();
            $table->string('provider')->default('manual');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['origin_port_id', 'destination_port_id'], 'sea_routes_ports_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sea_routes');
    }
};
