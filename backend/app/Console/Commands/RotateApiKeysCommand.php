<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class RotateApiKeysCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'security:rotate-keys {--force : Force la rotation sans demander confirmation} {--env= : Fichier env ciblé}';

    /**
     * The console command description.
     */
    protected $description = 'Pivoter la PRIMARY_KEY en SECONDARY_KEY et générer une nouvelle PRIMARY_KEY.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->warn('⚠️ DÉMARRAGE DE LA ROTATION DES CLÉS API ⚠️');

        if (!$this->option('force') && !$this->confirm('Êtes-vous sûr de vouloir remplacer les clés API de production ?')) {
            $this->info('Rotation annulée.');
            return 0;
        }

        $envFile = $this->option('env') ?: base_path('.env');

        if (!File::exists($envFile)) {
            $this->error("Fichier $envFile introuvable.");
            return 1;
        }

        $envContent = File::get($envFile);

        // Récupérer la PRIMARY_KEY actuelle
        preg_match('/^API_PRIMARY_KEY=(.*)$/m', $envContent, $matches);
        $currentPrimaryKey = trim($matches[1] ?? '');

        // Générer une nouvelle clé primaire sécurisée (64 chars)
        $newPrimaryKey = 'sk_live_' . Str::random(56);

        if (empty($currentPrimaryKey)) {
            $this->info("Aucune API_PRIMARY_KEY détectée. Création initiale...");
            // Ajout initial
            $envContent .= "\nAPI_PRIMARY_KEY={$newPrimaryKey}\nAPI_SECONDARY_KEY=\n";
        } else {
            // L'ancienne clé primaire devient la clé secondaire (pour transition douce)
            $envContent = preg_replace('/^API_SECONDARY_KEY=.*$/m', 'API_SECONDARY_KEY=' . $currentPrimaryKey, $envContent);
            // La nouvelle clé primaire est injectée
            $envContent = preg_replace('/^API_PRIMARY_KEY=.*$/m', 'API_PRIMARY_KEY=' . $newPrimaryKey, $envContent);
        }

        File::put($envFile, $envContent);

        $this->info("✅ ROTATION TERMINÉE AVEC SUCCÈS !");
        $this->line("🔑 Nouvelle PRIMARY_KEY   : <comment>{$newPrimaryKey}</comment>");
        $this->line("🔄 Ancienne PRIMARY (devenue SECONDAIRE) : <comment>{$currentPrimaryKey}</comment>");
        $this->line("N'oubliez pas d'exécuter 'php artisan config:cache' si nécessaire.");

        // Log d'audit
        \Log::channel('security')->info('Rotation des clés API effectuée.', [
            'user' => 'Console/Cron',
            'action' => 'api_key_rotation'
        ]);

        return 0;
    }
}
