<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->string('subject');
            $table->text('content');
            $table->enum('type', ['announcement', 'emergency', 'academic', 'private'])->default('announcement');
            $table->enum('channel', ['email', 'sms', 'push', 'all'])->default('push');
            $table->string('recipient_type'); // all, class, student, individual
            $table->unsignedBigInteger('recipient_id')->nullable(); // ID of target class or student if applicable
            $table->timestamp('sent_at')->nullable();
            $table->json('metadata')->nullable(); // Store stats like "open_count", "failure_count"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('communications');
    }
};
