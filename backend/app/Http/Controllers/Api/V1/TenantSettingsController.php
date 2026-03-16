<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TenantSettingsController extends Controller
{
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
        $apiKey = env('GOOGLE_MAPS_API_KEY');

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
}
