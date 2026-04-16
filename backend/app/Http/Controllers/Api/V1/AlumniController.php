<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Alumni;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AlumniController extends Controller
{
    /**
     * Display a listing of the alumni directory.
     */
    public function index(Request $request): JsonResponse
    {
        // On ne ramène que les public et on joint les infos de l'utilisateur (nom, prénom, photo_url)
        $alumnis = Alumni::with(['user:id,first_name,last_name,photo_url,email'])
                         ->where('is_public', true)
                         ->latest()
                         ->get();

        return response()->json([
            'status' => 'success',
            'data' => $alumnis
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'graduation_year' => 'nullable|integer',
            'current_company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'testimonial' => 'nullable|string',
            'is_public' => 'boolean'
        ]);

        // Un seul profil alumni par user_id
        $alumni = Alumni::updateOrCreate(
            ['user_id' => $validated['user_id']],
            $validated
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Profil alumni enregistré.',
            'data' => $alumni
        ], 201);
    }
}
