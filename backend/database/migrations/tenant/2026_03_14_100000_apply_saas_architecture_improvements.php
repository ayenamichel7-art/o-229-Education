<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Applique les correctifs de modélisation SaaS pour la sécurité et l'historisation.
     */
    public function up(): void
    {
        // 1. Ajout de la suppression logique (SoftDeletes) aux entités vitales
        Schema::table('users', function (Blueprint $table) { $table->softDeletes(); });
        Schema::table('teachers', function (Blueprint $table) { $table->softDeletes(); });
        Schema::table('school_classes', function (Blueprint $table) { $table->softDeletes(); });
        Schema::table('subjects', function (Blueprint $table) { $table->softDeletes(); });

        // 2. Correction de l'Historique Scolaire (Table Students)
        Schema::table('students', function (Blueprint $table) {
            // On retire la relation directe pour passer par une table d'inscription (Enrollments)
            $table->dropForeign(['class_id']);
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn(['class_id', 'academic_year_id']);
            $table->softDeletes();
        });

        // 3. Création de la table des Inscriptions (Historisation)
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('school_classes')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            
            $table->string('status')->default('active'); // active, dropped_out, transferred, graduated
            $table->date('enrollment_date')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // ✨ Un élève ne peut être inscrit qu'une seule fois par année académique
            $table->unique(['student_id', 'academic_year_id'], 'unique_enrollment_per_year');
        });

        // 4. Sécurisation et Performance des Notes (Grades)
        Schema::table('grades', function (Blueprint $table) {
            $table->softDeletes();
            // ✨ Empêche l'insertion de la même note en doublon pour un élève
            $table->unique(['student_id', 'subject_id', 'class_id', 'term', 'academic_year_id'], 'unique_grade_per_term');
            // ✨ Index Composite pour accélérer la génération des bulletins
            $table->index(['class_id', 'academic_year_id', 'term'], 'index_grades_class_year_term');
        });

        // 5. Performance des Présences (Attendances)
        Schema::table('attendances', function (Blueprint $table) {
            // ✨ Index Composite pour accélérer le calcul du taux d'absence d'une classe
            $table->index(['class_id', 'date'], 'index_attendances_class_date');
        });

        // 6. Refonte Financière (Invoices & Payment Transactions)
        Schema::dropIfExists('payments'); // Suppression du vieux modèle simpliste

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
            
            $table->string('title'); // ex: "Scolarité 2026-2027", "Frais de cantine"
            $table->string('type')->default('tuition');
            
            $table->decimal('total_amount', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('due_date')->nullable();
            
            $table->string('status')->default('pending'); // pending, partial, paid, cancelled
            $table->text('notes')->nullable();
            
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            
            $table->decimal('amount', 12, 2);
            $table->string('payment_method'); // cash, bank_transfer, momo, stripe
            $table->string('reference_number')->nullable()->unique();
            
            // ✨ L'URL de stockage sera un chemin relatif, protégé par Temporary URL MinIO
            $table->string('receipt_url')->nullable(); 
            
            $table->string('status')->default('success'); // pending, success, failed
            $table->timestamp('paid_at')->nullable();
            
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->foreign('recorded_by')->references('id')->on('users')->nullOnDelete();
            
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('invoices');

        // Restauration de l'ancienne table de paiements
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->decimal('amount_paid', 12, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('receipt_url')->nullable();
            $table->string('type')->default('tuition');
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->timestamps();
            $table->foreign('recorded_by')->references('id')->on('users')->nullOnDelete();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('index_attendances_class_date');
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->dropIndex('index_grades_class_year_term');
            $table->dropUnique('unique_grade_per_term');
            $table->dropSoftDeletes();
        });

        Schema::dropIfExists('enrollments');

        Schema::table('students', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
        });

        Schema::table('subjects', function (Blueprint $table) { $table->dropSoftDeletes(); });
        Schema::table('school_classes', function (Blueprint $table) { $table->dropSoftDeletes(); });
        Schema::table('teachers', function (Blueprint $table) { $table->dropSoftDeletes(); });
        Schema::table('users', function (Blueprint $table) { $table->dropSoftDeletes(); });
    }
};
