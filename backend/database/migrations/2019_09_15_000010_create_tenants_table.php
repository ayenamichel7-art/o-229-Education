<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTenantsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->string('id')->primary(); // Used as schema name

            // branding & info
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->string('hero_image_url')->nullable();
            $table->string('primary_color', 7)->default('#1E40AF');
            $table->string('secondary_color', 7)->default('#F59E0B');
            $table->string('accent_color', 7)->default('#10B981');
            $table->string('font_family')->default('Inter');
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            
            // localization
            $table->string('currency', 3)->default('XOF');
            $table->string('timezone')->default('Africa/Douala');
            $table->string('locale', 5)->default('fr');
            
            // status & settings
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->string('subscription_plan')->default('free');
            $table->timestamp('subscription_expires_at')->nullable();
            
            $table->timestamps();
            $table->json('data')->nullable(); // Required by the package for extra fields
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
}
