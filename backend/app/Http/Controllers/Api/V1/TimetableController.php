<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TimetableEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    /**
     * Get timetable for a specific class.
     */
    public function index(Request $request): JsonResponse
    {
        $classId = $request->query('class_id');
        $teacherId = $request->query('teacher_id');

        $timetable = TimetableEntry::with(['subject', 'teacher', 'schoolClass'])
            ->when($classId, fn($q) => $q->where('class_id', $classId))
            ->when($teacherId, fn($q) => $q->where('teacher_id', $teacherId))
            ->orderByRaw("FIELD(day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')")
            ->orderBy('start_time')
            ->get();

        return response()->json(['data' => $timetable]);
    }

    /**
     * Store a new timetable slot.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_id'    => 'required|exists:school_classes,id',
            'subject_id'  => 'required|exists:subjects,id',
            'teacher_id'  => 'required|exists:teachers,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'room'        => 'nullable|string|max:50',
        ]);

        $entry = TimetableEntry::create($validated);

        return response()->json([
            'message' => 'Plage horaire ajoutée au calendrier.',
            'data'    => $entry->load(['subject', 'teacher'])
        ], 201);
    }

    /**
     * Update a timetable slot.
     */
    public function update(Request $request, TimetableEntry $timetableEntry): JsonResponse
    {
        $validated = $request->validate([
            'subject_id'  => 'nullable|exists:subjects,id',
            'teacher_id'  => 'nullable|exists:teachers,id',
            'day_of_week' => 'nullable|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time'  => 'nullable|date_format:H:i',
            'end_time'    => 'nullable|date_format:H:i|after:start_time',
            'room'        => 'nullable|string|max:50',
        ]);

        $timetableEntry->update($validated);

        return response()->json([
            'message' => 'Emploi du temps mis à jour.',
            'data'    => $timetableEntry->load(['subject', 'teacher'])
        ]);
    }

    /**
     * Delete a timetable slot.
     */
    public function destroy(TimetableEntry $timetableEntry): JsonResponse
    {
        $timetableEntry->delete();
        return response()->json(['message' => 'Plage horaire supprimée.']);
    }
}
