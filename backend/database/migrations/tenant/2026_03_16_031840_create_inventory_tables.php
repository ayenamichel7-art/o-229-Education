<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Inventory Items (Uniforms, Books, Furniture, etc.)
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique()->nullable();
            $table->string('category'); // uniforms, supplies, furniture, etc.
            $table->text('description')->nullable();
            $table->integer('unit_price')->default(0);
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_level')->default(5); // Alert threshold
            $table->string('unit')->default('pcs'); // pcs, box, kg
            $table->boolean('is_sellable')->default(true); // Can be sold to students
            $table->timestamps();
        });

        // Stock Transactions (In/Out/Sale)
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'sale', 'adjustment']);
            $table->integer('quantity');
            $table->integer('price_at_transaction')->nullable(); // For sales/purchase tracking
            $table->string('reference_type')->nullable(); // e.g. "student_payment"
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('recorded_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory_items');
    }
};
