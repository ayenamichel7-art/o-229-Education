<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3000,http://localhost')),

    'allowed_origins_patterns' => [
        // Wildcard support for tenant sub-domains: *.o-229.com
        'https?://.*\.o-229\.com',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400, // Cache CORS preflight for 24 hours

    'supports_credentials' => true, // CRITICAL for Sanctum cookie authentication

];
