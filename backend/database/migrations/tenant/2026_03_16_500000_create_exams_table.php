<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('test'); // test, exam, quiz, homework
            $table->date('date');
            $table->foreignId('class_id')->constrained('school_classes')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained()->onDelete('cascade');
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('term')->default(1);
            $table->decimal('max_score', 5, 2)->default(20.00);
            $table->decimal('weight', 3, 1)->default(1.0);
            $table->string('status')->default('planned'); // planned, completed, results_entered, published
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->foreignId('exam_id')->nullable()->after('student_id')->constrained()->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropForeign(['exam_id']);
            $table->dropColumn('exam_id');
        });
        Schema::dropIfExists('exams');
    }
};
