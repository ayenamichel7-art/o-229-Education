<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolClassController extends Controller
{
    public function index(): JsonResponse
    {
        $classes = SchoolClass::withCount('students')->get();
        return response()->json(['data' => $classes]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:50',
            'level'    => 'required|string',
            'capacity' => 'nullable|integer',
        ]);

        $class = SchoolClass::create($validated);
        return response()->json(['data' => $class], 201);
    }
}
