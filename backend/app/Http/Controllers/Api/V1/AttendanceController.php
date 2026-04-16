<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\TimetableEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function __construct()
    {
        // Only teachers and admins can manage attendance
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasAnyRole(['admin', 'teacher'])) {
                abort(403, 'Accès réservé aux enseignants et administrateurs.');
            }
            return $next($request);
        });
    }

    /**
     * Get attendance sheet for a class/subject at a specific time.
     */
    public function index(Request $request): JsonResponse
    {
        $classId = $request->query('class_id');
        $date = $request->query('date', now()->toDateString());
        $timetableEntryId = $request->query('timetable_entry_id');

        if (!$classId) {
            return response()->json(['message' => 'Class ID is required'], 400);
        }

        // Fetch students in the class
        $students = Student::with('user')
            ->where('class_id', $classId)
            ->get();

        // Fetch existing attendance records for this slot
        $records = Attendance::where('class_id', $classId)
            ->where('date', $date)
            ->when($timetableEntryId, fn($q) => $q->where('timetable_entry_id', $timetableEntryId))
            ->get()
            ->keyBy('student_id');

        $data = $students->map(function ($student) use ($records) {
            return [
                'student_id' => $student->id,
                'name'       => $student->user->getFullNameAttribute(),
                'status'     => $records->has($student->id) ? $records[$student->id]->status : 'present',
                'remarks'    => $records->has($student->id) ? $records[$student->id]->remarks : '',
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Bulk store attendance records and trigger notifications.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_id'           => 'required|exists:school_classes,id',
            'timetable_entry_id' => 'nullable|exists:timetable_entries,id',
            'date'               => 'required|date',
            'attendance'         => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status'     => 'required|in:present,absent,late,excused',
            'attendance.*.remarks'    => 'nullable|string',
        ]);

        $recordedBy = auth()->id();
        $absentees = [];

        foreach ($validated['attendance'] as $item) {
            $record = Attendance::updateOrCreate(
                [
                    'student_id'         => $item['student_id'],
                    'class_id'           => $validated['class_id'],
                    'timetable_entry_id' => $validated['timetable_entry_id'],
                    'date'               => $validated['date'],
                ],
                [
                    'status'      => $item['status'],
                    'remarks'     => $item['remarks'] ?? null,
                    'recorded_by' => $recordedBy,
                ]
            );

            if ($item['status'] === 'absent') {
                $absentees[] = $item['student_id'];
            }
        }

        // Trigger Notifications for absentees
        if (count($absentees) > 0) {
            $this->notifyParents($absentees, $validated['class_id'], $validated['timetable_entry_id']);
        }

        return response()->json([
            'message' => 'Pointage enregistré. ' . count($absentees) . ' absence(s) signalée(s) aux parents.',
        ]);
    }

    /**
     * Internal method to trigger push/SMS notifications.
     */
    private function notifyParents(array $studentIds, $classId, $timetableEntryId)
    {
        $students = Student::with(['user', 'timetableEntry.subject'])->whereIn('id', $studentIds)->get();
        $entry = $timetableEntryId ? TimetableEntry::with('subject')->find($timetableEntryId) : null;
        $subjectName = $entry ? $entry->subject->name : 'Cours';

        foreach ($students as $student) {
            $parentName = "Parent de " . $student->user->first_name;
            $message = "⚠️ Alerte Présence [O-229] : " . $student->user->getFullNameAttribute() . " est marqué ABSENT au cours de $subjectName aujourd'hui.";
            
            Log::info("Notification envoyée à $parentName : $message");

            // Dispatch real SMS
            $phone = $student->guardian_phone ?? ($student->user->phone ?? null);
            if ($phone) {
                app(\App\Services\SmsService::class)->send($phone, $message);
            }
        }
    }
}
