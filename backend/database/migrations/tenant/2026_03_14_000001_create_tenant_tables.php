<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for each Tenant Schema.
     */
    public function up(): void
    {
        // ─── Users (Tenant Specific) ──────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->string('locale', 5)->default('fr');
            $table->rememberToken();
            $table->timestamps();
        });

        // ─── Permissions & Roles (Tenant Specific) ────────────
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('guard_name');
            $table->timestamps();
            $table->unique(['name', 'guard_name']);
        });

        Schema::create('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['permission_id', 'model_id', 'model_type'], 'model_has_permissions_primary');
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
        });

        Schema::create('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['role_id', 'model_id', 'model_type'], 'model_has_roles_primary');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
        });

        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('role_id');
            $table->primary(['permission_id', 'role_id']);
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
        });

        // ─── Academic Years ──────────────────────────────────
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('starts_at');
            $table->date('ends_at');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
        });

        // ─── Subjects ────────────────────────────────────────
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique()->nullable();
            $table->text('description')->nullable();
            $table->decimal('coefficient', 3, 1)->default(1.0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ─── Teachers ────────────────────────────────────────
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('employee_id')->unique()->nullable();
            $table->string('specialization')->nullable();
            $table->string('qualification')->nullable();
            $table->date('hire_date')->nullable();
            $table->string('contract_type')->default('full-time');
            $table->decimal('salary', 12, 2)->nullable();
            $table->string('status')->default('active');
            $table->text('bio')->nullable();
            $table->timestamps();
        });

        // ─── School Classes ──────────────────────────────────
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('level');
            $table->string('section')->nullable();
            $table->unsignedInteger('capacity')->default(40);
            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('class_teacher_id')->nullable();
            $table->timestamps();
            $table->foreign('class_teacher_id')->references('id')->on('teachers')->nullOnDelete();
        });

        // ─── Students ────────────────────────────────────────
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('matricule')->unique()->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('birth_place')->nullable();
            $table->string('country_origin')->nullable();
            $table->string('gender')->nullable();
            $table->text('address')->nullable();
            $table->string('pickup_authorization_type')->nullable(); 
            $table->string('pickup_contact_name')->nullable();
            $table->boolean('media_authorization')->default(false);
            $table->string('guardian_name')->nullable();
            $table->string('guardian_phone')->nullable();
            $table->string('guardian_email')->nullable();
            $table->string('guardian_relationship')->nullable();
            $table->string('guardian_profession')->nullable();
            $table->string('blood_group')->nullable();
            $table->text('medical_notes')->nullable();
            $table->date('enrollment_date')->nullable();
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status')->default('active');
            $table->string('family_situation')->nullable();
            $table->string('handicap_type')->nullable();
            $table->string('photo_url')->nullable();
            
            // Documents stored on MinIO
            $table->string('doc_birth_certificate_url')->nullable();
            $table->string('doc_report_card_url')->nullable();
            $table->string('doc_school_certificate_url')->nullable();
            $table->string('doc_passport_photo_url')->nullable();
            $table->string('doc_exam_result_url')->nullable();
            $table->string('doc_medical_certificate_url')->nullable();

            $table->timestamps();
        });

        // ─── Grades ──────────────────────────────────────────
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('academic_year_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('term')->default(1);
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2)->default(20.00);
            $table->string('grade_letter', 2)->nullable();
            $table->text('comment')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->timestamps();
            $table->foreign('recorded_by')->references('id')->on('users')->nullOnDelete();
        });

        // ─── Payments ────────────────────────────────────────
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

        // ─── Attendances ─────────────────────────────────────
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->date('date');
            $table->string('status'); 
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable();
            $table->timestamps();
            $table->unique(['student_id', 'date']);
            $table->foreign('recorded_by')->references('id')->on('users')->nullOnDelete();
        });

        // ─── Activity Logs (Audit Trail) ─────────────────────
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('entity_type');
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('performed_at');
            $table->timestamps();
        });

        // ─── Sessions (Tenant) ───────────────────────────────
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // ─── Password Reset (Tenant) ──────────────────────────
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // ─── Mobile Apps (Tenant) ────────────────────────────
        Schema::create('mobile_apps', function (Blueprint $table) {
            $table->id();
            $table->string('app_name');
            $table->string('package_name')->unique();
            $table->string('version');
            $table->string('status')->default('pending');
            $table->json('config')->nullable();
            $table->string('icon_url')->nullable();
            $table->string('splash_url')->nullable();
            $table->string('apk_url')->nullable();
            $table->string('ios_url')->nullable();
            $table->timestamp('last_build_at')->nullable();
            $table->timestamps();
        });

         // ─── Pivot Tables ────────────────────────────────────
        Schema::create('teacher_subject', function (Blueprint $table) {
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->primary(['teacher_id', 'subject_id']);
        });

        Schema::create('teacher_class', function (Blueprint $table) {
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('class_id');
            $table->foreign('class_id')->references('id')->on('school_classes')->onDelete('cascade');
            $table->primary(['teacher_id', 'class_id']);
        });

        Schema::create('class_subject', function (Blueprint $table) {
            $table->unsignedBigInteger('school_class_id');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreign('school_class_id')->references('id')->on('school_classes')->onDelete('cascade');
            $table->primary(['school_class_id', 'subject_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_subject');
        Schema::dropIfExists('teacher_class');
        Schema::dropIfExists('teacher_subject');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('students');
        Schema::dropIfExists('school_classes');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('academic_years');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('model_has_roles');
        Schema::dropIfExists('model_has_permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('users');
    }
};
