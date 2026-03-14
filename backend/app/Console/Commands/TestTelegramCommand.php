<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TelegramService;
use Illuminate\Support\Facades\Mail;

class TestTelegramCommand extends Command
{
    protected $signature = 'test:telegram';
    protected $description = 'Send a test message to Telegram using the configured bot token and chat ID';

    public function handle(TelegramService $telegram)
    {
        $this->info('Testing Telegram connection...');
        
        $token = config('watchdog.telegram.bot_token');
        $chatId = config('watchdog.telegram.chat_id');
        
        if (empty($token) || empty($chatId)) {
            $this->error('Telegram Token or Chat ID is missing in `.env` configuration.');
            $this->error("Current Token: {$token}");
            $this->error("Current Chat ID: {$chatId}");
            return;
        }

        $message = "🤖 *Test o-229 Watchdog*\nCeci est un message de test envoyé depuis votre serveur backend après la configuration de votre nouveau bot !";

        $success = $telegram->sendMessage($message);

        if ($success) {
            $this->info('✅ Test message successfully sent to Telegram!');
        } else {
            $this->error('❌ Failed to send Telegram message. Please check the Laravel log (`storage/logs/laravel.log`).');
        }
    }
}
