<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
        
        // Trust only Cloudflare proxy IPs — prevents X-Forwarded-For spoofing
        $middleware->trustProxies(at: [
            // Cloudflare IPv4 ranges (https://www.cloudflare.com/ips-v4/)
            '173.245.48.0/20',
            '103.21.244.0/22',
            '103.22.200.0/22',
            '103.31.4.0/22',
            '141.101.64.0/18',
            '108.162.192.0/18',
            '190.93.240.0/20',
            '188.114.96.0/20',
            '197.234.240.0/22',
            '198.41.128.0/17',
            '162.158.0.0/15',
            '104.16.0.0/13',
            '104.24.0.0/14',
            '172.64.0.0/13',
            '131.0.72.0/22',
            // Docker internal network (for local dev / Nginx → PHP-FPM)
            '172.0.0.0/8',
            '10.0.0.0/8',
            '192.168.0.0/16',
            '127.0.0.1',
        ]);
        
        $middleware->append(\App\Http\Middleware\SetLocale::class);
        $middleware->statefulApi();
        $middleware->alias([
            'feature' => \App\Http\Middleware\CheckFeature::class,
            'tenancy' => \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            'tenancy.subdomain' => \Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
