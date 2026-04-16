<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('discipline_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('recorded_by')->constrained('users');
            $table->enum('category', ['merit', 'demerit', 'sanction'])->default('demerit');
            $table->string('reason');
            $table->text('description')->nullable();
            $table->integer('points')->default(0); // For gamification/merit system
            $table->string('sanction_type')->nullable(); // exclusion, warning, blâme
            $table->date('incident_date');
            $table->boolean('notified_parents')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('discipline_records');
    }
};
