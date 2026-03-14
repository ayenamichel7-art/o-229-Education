<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public config endpoint — no auth required.
 * Returns branding based on the calling domain/subdomain.
 */
class ConfigController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $host = $request->getHost();
        $baseDomain = config('app.domain', 'o-229.com');
        $subdomain = str_replace('.' . $baseDomain, '', $host);

        $tenant = null;

        // Try subdomain
        if ($subdomain && $subdomain !== $host && $subdomain !== 'www') {
            $tenant = Tenant::where('slug', $subdomain)->first();
        }

        // Try custom domain
        if (! $tenant) {
            $tenant = Tenant::where('domain', $host)->first();
        }

        // Dev: header fallback
        if (! $tenant && app()->environment('local')) {
            $slug = $request->header('X-Tenant-Slug', $request->query('tenant'));
            if ($slug) {
                $tenant = Tenant::where('slug', $slug)->first();
            }
        }

        if (! $tenant) {
            return response()->json([
                'message' => 'School not found for this domain.',
            ], 404);
        }

        return response()->json([
            'data' => $tenant->getBrandingConfig(),
        ]);
    }
}
