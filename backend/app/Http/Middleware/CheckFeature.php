<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFeature
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        // Use stancl/tenancy global helper to get the active tenant
        $tenant = tenant();

        if (!$tenant || !method_exists($tenant, 'hasFeature') || !$tenant->hasFeature($feature)) {
            return response()->json([
                'message' => "Cette fonctionnalité n'est pas activée pour votre établissement.",
                'feature' => $feature,
                'requirement' => 'Désolé, votre abonnement actuel ne permet pas d\'accéder à ce module.'
            ], 403);
        }

        return $next($request);
    }
}
