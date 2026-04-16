<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TenantSettingsController extends Controller
{
    public function __construct()
    {
        // Only admins can modify tenant settings
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasRole('admin')) {
                abort(403, 'Seuls les administrateurs peuvent modifier les paramètres.');
            }
            return $next($request);
        });
    }

    /**
     * Update tenant location settings.
     */
    public function updateLocation(Request $request): JsonResponse
    {
        $request->validate([
            'address' => 'required|string',
            'google_place_id' => 'required|string',
        ]);

        $tenant = resolve('current_tenant');
        
        // On pourrait ici appeler l'API Google Places pour récupérer lat/long depuis le place_id
        // pour plus de précision si nécessaire.
        
        $tenant->update([
            'address' => $request->address,
            'google_place_id' => $request->google_place_id,
            // Optionnel: latitude/longitude si récupérées
        ]);

        return response()->json([
            'message' => 'Localisation mise à jour avec succès.',
            'data' => $tenant->getBrandingConfig()
        ]);
    }

    /**
     * Proxy for Google Places search (simulated or real).
     */
    public function googlePlacesProxy(Request $request): JsonResponse
    {
        $query = $request->query('q');
        $apiKey = config('services.google.maps_api_key');

        if (!$apiKey) {
            return response()->json(['message' => 'Google Maps API Key not configured on server.'], 500);
        }

        // Appel réel à l'API Google Places TextSearch
        $response = Http::get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', [
            'input' => $query,
            'inputtype' => 'textquery',
            'fields' => 'place_id,formatted_address,geometry',
            'key' => $apiKey
        ]);

        if ($response->successful() && !empty($response->json('candidates'))) {
            $candidate = $response->json('candidates')[0];
            return response()->json([
                'place_id' => $candidate['place_id'],
                'address' => $candidate['formatted_address'],
                'location' => $candidate['geometry']['location'] ?? null
            ]);
        }

        return response()->json(['message' => 'Aucun lieu trouvé.'], 404);
    }

    /**
     * Update report card branding settings.
     */
    public function updateReportSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'primary_color'   => 'nullable|string|max:7', // #RRGGBB
            'secondary_color' => 'nullable|string|max:7',
            'header_style'    => 'nullable|string|in:classic,modern,simple',
        ]);

        $tenant = resolve('current_tenant');
        $settings = $tenant->settings ?? [];
        $settings['report_card'] = array_merge($settings['report_card'] ?? [], $validated);

        $tenant->update(['settings' => $settings]);

        return response()->json([
            'message' => 'Paramètres du bulletin mis à jour.',
            'data'    => $settings['report_card']
        ]);
    }

    /**
     * Update tenant branding (logo, seal, colors).
     */
    public function updateBranding(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'logo_url'      => 'nullable|url',
            'seal_url'      => 'nullable|url',
            'primary_color' => 'nullable|string|size:7',
        ]);

        $tenant = resolve('current_tenant');
        $tenant->update($validated);

        return response()->json([
            'message' => 'Identité visuelle mise à jour.',
            'data'    => $tenant->getBrandingConfig()
        ]);
    }

    /**
     * Upload school seal (cachet).
     */
    public function uploadSeal(Request $request): JsonResponse
    {
        $request->validate([
            'seal' => 'required|image|mimes:png|max:512', // Max 512KB, PNG forced for transparency
        ]);

        $tenant = resolve('current_tenant');
        $path = $request->file('seal')->store("tenants/{$tenant->id}/branding", 'public');
        
        $tenant->update(['seal_url' => asset("storage/$path")]);

        return response()->json([
            'message' => 'Le cachet officiel a été importé avec succès.',
            'url' => $tenant->seal_url
        ]);
    }

    /**
     * Upload school logo.
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg|max:1024', // SVG excluded: can contain embedded JS (Stored XSS)
        ]);

        $tenant = resolve('current_tenant');
        $path = $request->file('logo')->store("tenants/{$tenant->id}/branding", 'public');
        
        $tenant->update(['logo_url' => asset("storage/$path")]);

        return response()->json([
            'message' => 'Le logo de l\'école a été mis à jour.',
            'url' => $tenant->logo_url
        ]);
    }
}
