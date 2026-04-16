<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LessonLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonLogController extends Controller
{
    /**
     * List lesson logs for a class and subject.
     */
    public function index(Request $request): JsonResponse
    {
        $classId   = $request->query('class_id');
        $subjectId = $request->query('subject_id');
        $teacherId = $request->query('teacher_id');

        $logs = LessonLog::with(['subject', 'teacher', 'schoolClass'])
            ->when($classId,   fn($q) => $q->where('class_id',   $classId))
            ->when($subjectId, fn($q) => $q->where('subject_id', $subjectId))
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->orderBy('date', 'desc')
            ->paginate($request->query('per_page', 20));

        return response()->json($logs);
    }

    /**
     * Store a new lesson entry (Cahier de texte).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'timetable_entry_id' => 'nullable|exists:timetable_entries,id',
            'class_id'           => 'required|exists:school_classes,id',
            'subject_id'         => 'required|exists:subjects,id',
            'teacher_id'         => 'required|exists:teachers,id',
            'date'               => 'required|date',
            'topic'              => 'required|string|max:255',
            'description'        => 'nullable|string',
            'homework'           => 'nullable|string',
            'homework_due_date'  => 'nullable|date|after_or_equal:date',
            'attachments'        => 'nullable|array',
        ]);

        $log = LessonLog::create($validated);

        return response()->json([
            'message' => 'Entrée ajoutée au cahier de texte.',
            'data'    => $log->load(['subject', 'teacher'])
        ], 201);
    }

    /**
     * Update a lesson entry.
     */
    public function update(Request $request, LessonLog $lessonLog): JsonResponse
    {
        $validated = $request->validate([
            'topic'             => 'nullable|string|max:255',
            'description'       => 'nullable|string',
            'homework'          => 'nullable|string',
            'homework_due_date' => 'nullable|date|after_or_equal:date',
            'attachments'       => 'nullable|array',
        ]);

        $lessonLog->update($validated);

        return response()->json([
            'message' => 'Cahier de texte mis à jour.',
            'data'    => $lessonLog->load(['subject', 'teacher'])
        ]);
    }

    /**
     * Delete a lesson entry.
     */
    public function destroy(LessonLog $lessonLog): JsonResponse
    {
        $lessonLog->delete();
        return response()->json(['message' => 'Entrée supprimée du cahier de texte.']);
    }
}
