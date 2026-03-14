<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\LandingPage;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the central application database.
     */
    public function run(): void
    {
        // ─── Central Landing Page ──────────────────────────
        LandingPage::create([
            'slug' => 'home',
            'title' => 'Bienvenue sur o-229 Education',
            'content' => [
                'hero' => 'La plateforme de gestion scolaire de nouvelle génération.',
                'features' => ['Multi-écoles', 'Isolation totale', 'PWA & Mobile'],
            ],
            'is_published' => true,
        ]);

        // ─── Default Tenant (École Horizon) ───────────────
        if (Tenant::count() === 0) {
            $tenant = Tenant::create([
                'id'              => 'horizon', // Schema name
                'name'            => 'École Horizon',
                'slug'            => 'horizon',
                'email'           => 'admin@horizon.o-229.com',
                'primary_color'   => '#1E40AF',
                'secondary_color' => '#F59E0B',
                'tagline'         => 'Former les leaders de demain',
            ]);

            $tenant->domains()->create([
                'domain' => 'horizon.o-229.com',
            ]);

            $this->command->info('✅ Central database seeded. Demo tenant "horizon" created.');
            $this->command->info('👉 Run [php artisan tenants:seed] to seed the tenant schemas.');
        }
    }
}
