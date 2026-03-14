<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Watchdog Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the system health watchdog command.
    | These values were previously read with env() directly in the command,
    | which breaks when config is cached in production.
    |
    */

    'webhook_url' => env('WATCHDOG_WEBHOOK_URL'),

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'chat_id'   => env('TELEGRAM_CHAT_ID'),
    ],

    'mail' => [
        'recipient' => env('MAIL_USERNAME'),
    ],

    'disk_space' => [
        'threshold_percent' => 10, // Alert if free space drops below this %
    ],

];
