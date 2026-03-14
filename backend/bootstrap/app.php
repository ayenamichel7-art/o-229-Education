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
        // Approuver le SSL/HTTPS venant de Cloudflare ou Nginx
        $middleware->trustProxies(at: '*');
        
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
