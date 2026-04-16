<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function index(): JsonResponse
    {
        $teachers = Teacher::with('user')->get();
        return response()->json(['data' => $teachers]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id'        => 'required|exists:users,id',
            'specialization' => 'nullable|string',
        ]);

        $teacher = Teacher::create($validated);
        return response()->json(['data' => $teacher->load('user')], 201);
    }
}
