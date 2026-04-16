<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Transport Routes (The buses/vans)
        Schema::create('transport_routes', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Route Nord - Van 1"
            $table->string('vehicle_reg')->nullable();
            $table->string('driver_name')->nullable();
            $table->string('driver_phone')->nullable();
            $table->integer('capacity')->default(0);
            $table->decimal('monthly_cost', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Transport Subscriptions (Students on buses)
        Schema::create('transport_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('route_id')->constrained('transport_routes')->onDelete('cascade');
            $table->string('pickup_point')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'cancelled'])->default('active');
            $table->timestamps();
        });

        // Canteen Plans (The menus/packages)
        Schema::create('canteen_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "Menu Standard", "Menu Végétarien"
            $table->text('description')->nullable();
            $table->decimal('cost_per_month', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Canteen Subscriptions (Students eating)
        Schema::create('canteen_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('canteen_plans')->onDelete('cascade');
            $table->text('dietary_restrictions')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'cancelled'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('canteen_subscriptions');
        Schema::dropIfExists('canteen_plans');
        Schema::dropIfExists('transport_subscriptions');
        Schema::dropIfExists('transport_routes');
    }
};
