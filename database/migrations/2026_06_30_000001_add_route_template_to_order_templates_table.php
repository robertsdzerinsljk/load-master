<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table
                ->unsignedBigInteger('route_template_id')
                ->nullable()
                ->after('end_port_id')
                ->index();
        });
    }

    public function down(): void
    {
        Schema::table('order_templates', function (Blueprint $table) {
            $table->dropIndex(['route_template_id']);
            $table->dropColumn('route_template_id');
        });
    }
};
