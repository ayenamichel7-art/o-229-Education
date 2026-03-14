<?php

use Illuminate\Support\Str;

return [
    'default' => env('CACHE_STORE', 'database'),
    'stores' => [
        'database' => [
            'driver' => 'database',
            'connection' => env('CACHE_DB_CONNECTION', 'pgsql'),
            'table' => env('CACHE_DB_TABLE', 'cache'),
            'lock_connection' => env('CACHE_DB_LOCK_CONNECTION'),
            'lock_table' => env('CACHE_DB_LOCK_TABLE'),
        ],
        'redis' => [
            'driver' => 'redis',
            'connection' => env('CACHE_REDIS_CONNECTION', 'default'),
            'lock_connection' => env('CACHE_REDIS_LOCK_CONNECTION', 'default'),
        ],
    ],
    'prefix' => env('CACHE_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_cache_'),
];
