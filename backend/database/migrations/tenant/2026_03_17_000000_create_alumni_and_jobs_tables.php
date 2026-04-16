<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Table des Alumni (Anciens Élèves)
        Schema::create('alumnis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('graduation_year')->nullable();
            $table->string('current_company')->nullable();
            $table->string('position')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->text('testimonial')->nullable();
            $table->boolean('is_public')->default(true); // Afficher ou non dans l'annuaire
            $table->timestamps();
        });

        // Table des Offres d'Emploi/Stages (JobBoard)
        Schema::create('job_offers', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('company');
            $table->string('location')->nullable();
            $table->text('description');
            $table->enum('type', ['cdi', 'cdd', 'internship', 'freelance'])->default('cdi');
            $table->string('application_url')->nullable();
            $table->string('contact_email')->nullable();
            $table->foreignId('creator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_offers');
        Schema::dropIfExists('alumnis');
    }
};
