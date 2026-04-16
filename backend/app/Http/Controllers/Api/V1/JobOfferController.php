<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\JobOffer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobOfferController extends Controller
{
    /**
     * Display a listing of job offers.
     */
    public function index(Request $request): JsonResponse
    {
        // Récupère les offres actives récentes, ou non expirées
        $offers = JobOffer::with('creator:id,first_name,last_name')
            ->where('is_active', true)
            ->where(function($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $offers
        ]);
    }

    /**
     * Store a newly created job offer in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'required|string',
            'type' => 'required|in:cdi,cdd,internship,freelance',
            'application_url' => 'nullable|url|max:255',
            'contact_email' => 'nullable|email|max:255',
            'expires_at' => 'nullable|date'
        ]);

        $validated['creator_id'] = $request->user()->id;
        $validated['is_active'] = true;

        $offer = JobOffer::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Offre publiée avec succès.',
            'data' => $offer
        ], 201);
    }
}
