<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * TelegramService — O-229 Alerting System
 *
 * Handles outgoing notifications to the configured Telegram bot.
 */
class TelegramService
{
    /**
     * Send a markdown message to the configured Telegram chat.
     */
    public function sendMessage(string $text, string $parseMode = 'Markdown'): bool
    {
        $botToken = config('watchdog.telegram.bot_token');
        $chatId = config('watchdog.telegram.chat_id');

        if (!$botToken || !$chatId) {
            Log::warning('Telegram Service: Bot token or Chat ID not configured.');
            return false;
        }

        try {
            $response = Http::withoutVerifying()->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text'    => $text,
                'parse_mode' => $parseMode,
            ]);

            if ($response->failed()) {
                Log::error('Telegram Service: Failed to send message.', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return false;
            }

            return true;
        } catch (\Exception $e) {
            Log::error('Telegram Service: Exception occurred.', [
                'message' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
