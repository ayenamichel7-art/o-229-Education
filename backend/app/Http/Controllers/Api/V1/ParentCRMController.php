<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\ParentInteraction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ParentCRMController extends Controller
{
    /**
     * Liste les étudiants avec leurs tuteurs (CRM View)
     */
    public function index(Request $request): JsonResponse
    {
        // On récupère les étudiants avec leurs relations classe et utilisateur (pour nom/prénom)
        // et le compte des interactions
        $students = Student::with(['user:id,first_name,last_name,photo_url', 'schoolClass:id,name'])
            ->withCount('payments') // Peut-être utile pour voir les retards
            ->get()
            ->map(function ($student) {
                // On attache un décompte des interactions récentes pour le Frontend
                $interactionsCount = ParentInteraction::where('student_id', $student->id)->count();
                $lastInteraction = ParentInteraction::where('student_id', $student->id)
                                    ->latest('interaction_date')
                                    ->first();
                
                return [
                    'id' => $student->id,
                    'student_name' => $student->user ? $student->user->first_name . ' ' . $student->user->last_name : 'Inconnu',
                    'class_name' => $student->schoolClass ? $student->schoolClass->name : 'N/A',
                    'guardian_name' => $student->guardian_name,
                    'guardian_phone' => $student->guardian_phone,
                    'guardian_email' => $student->guardian_email,
                    'guardian_relationship' => $student->guardian_relationship,
                    'interactions_count' => $interactionsCount,
                    'last_interaction_date' => $lastInteraction ? $lastInteraction->interaction_date : null,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $students
        ]);
    }

    /**
     * Récupère l'historique d'un tuteur/étudiant spécifique
     */
    public function showInteractions(Student $student): JsonResponse
    {
        $interactions = ParentInteraction::with('staff:id,first_name,last_name,roles')
            ->where('student_id', $student->id)
            ->latest('interaction_date')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $interactions
        ]);
    }

    /**
     * Ajoute une nouvelle interaction
     */
    public function storeInteraction(Request $request, Student $student): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:call,email,meeting,sms,other',
            'interaction_date' => 'required|date',
            'notes' => 'nullable|string',
            'status' => 'required|in:completed,scheduled'
        ]);

        $validated['student_id'] = $student->id;
        $validated['staff_id'] = $request->user()->id;

        $interaction = ParentInteraction::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Interaction enregistrée avec succès.',
            'data' => $interaction->load('staff:id,first_name,last_name,roles')
        ], 201);
    }
}
