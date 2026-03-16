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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('google_place_id')->nullable()->after('address');
            $table->decimal('latitude', 10, 8)->nullable()->after('google_place_id');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('google_maps_url')->nullable()->after('longitude');
            $table->boolean('has_google_business')->default(false)->after('google_maps_url');
            $table->boolean('google_business_verified')->default(false)->after('has_google_business');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'google_place_id',
                'latitude',
                'longitude',
                'google_maps_url',
                'has_google_business',
                'google_business_verified',
            ]);
        });
    }
};
