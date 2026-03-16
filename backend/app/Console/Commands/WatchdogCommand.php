<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WatchdogCommand extends Command
{
    protected $signature = 'app:watchdog';
    protected $description = 'Run a full system check (composer audit, endpoints check) and alert on failure';

    public function handle()
    {
        $this->info('Starting Watchdog checks...');

        $alerts = [];

        // 1. Check vulnerabilities with Composer Audit
        $this->info('Running Composer Audit...');
        $output = [];
        $returnVar = 0;
        
        exec('composer audit --format=json', $output, $returnVar);
        
        $auditResult = implode("\n", $output);
        $auditJson = json_decode($auditResult, true);

        if ($returnVar !== 0 && $auditJson && isset($auditJson['advisories']) && count($auditJson['advisories']) > 0) {
            $alerts[] = '🚨 **Vulnerabilities Found in Dependencies!** (' . count($auditJson['advisories']) . ' issues)';
            $this->error('Vulnerabilities found.');
        } else {
            $this->info('No vulnerabilities found.');
        }

        // 2. Simple Health / Database Check
        $this->info('Checking Database Connection...');
        try {
            \DB::connection()->getPdo();
            $this->info('Database is healthy.');
        } catch (\Exception $e) {
            $alerts[] = '🚨 **Database Connection Failed!** ' . $e->getMessage();
            $this->error('Database connection failed.');
        }

        // 3. Disk Space Check
        $this->info('Checking Disk Space...');
        $diskSpace = disk_free_space('/');
        $totalSpace = disk_total_space('/');
        $freePercentage = ($diskSpace / $totalSpace) * 100;
        $threshold = config('watchdog.disk_space.threshold_percent', 10);
        
        if ($freePercentage < $threshold) {
            $alerts[] = '🚨 **Low Disk Space!** Only ' . round($freePercentage, 2) . '% remaining on root volume.';
            $this->error('Low disk space.');
        } else {
            $this->info('Disk space is adequate (' . round($freePercentage, 2) . '% free).');
        }

        // Dispatch alerts if any exist
        if (count($alerts) > 0) {
            $this->sendAlert(implode("\n", $alerts));
        } else {
            $this->info('All systems nominal. Watchdog finished successfully.');
        }
    }

    private function sendAlert(string $message)
    {
        // 1. Log to Sentry or general errors
        Log::error("Watchdog Alert Triggered:\n" . $message);

        // 2. Notify via Telegram (if configured)
        $telegram = resolve(\App\Services\TelegramService::class);
        $telegramText = "🤖 *o-229 System Watchdog Alert*\n" . $message;
        $telegram->sendMessage($telegramText);
        $this->info('Alerts dispatched to Telegram.');

        // 3. Notify via Generic Webhook (Discord etc.)
        $webhookUrl = config('watchdog.webhook_url');
        if ($webhookUrl) {
            Http::post($webhookUrl, [
                'content' => "🤖 **o-229 System Watchdog Alert**\n" . $message
            ]);
            $this->info('Alerts dispatched to Webhook.');
        }

        // 4. Notify via Email
        $mailRecipient = config('watchdog.mail.recipient');
        if ($mailRecipient) {
            try {
                \Illuminate\Support\Facades\Mail::raw($message, function ($mail) use ($mailRecipient) {
                    $mail->to($mailRecipient)
                         ->subject('🤖 o-229 Watchdog Alert - Rapport de Vulnérabilités');
                });
                $this->info('Alerts dispatched to Email.');
            } catch (\Exception $e) {
                // Ignore exception locally if mailer is not setup
                $this->error('Failed to send email alert. Make sure MAIL_ settings are correct in .env');
                Log::error('Mail Watchdog error: ' . $e->getMessage());
            }
        }

        if (! config('watchdog.telegram.bot_token') && ! $webhookUrl) {
            $this->warn('No notification channels (Telegram/Webhook) configured.');
        }
    }
}
