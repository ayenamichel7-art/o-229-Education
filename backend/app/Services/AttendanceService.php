<?php

namespace App\Services;

use App\Models\Attendance;
use Illuminate\Support\Collection;

class AttendanceService
{
    /**
     * Record attendance for a class on a given date.
     */
    public function recordBulkAttendance(int $classId, string $date, array $records): Collection
    {
        $attendances = collect();

        foreach ($records as $record) {
            $attendance = Attendance::updateOrCreate(
                [
                    'student_id' => $record['student_id'],
                    'class_id'   => $classId,
                    'date'       => $date,
                ],
                [
                    'status'      => $record['status'],
                    'remarks'     => $record['remarks'] ?? null,
                    'recorded_by' => auth()->id(),
                ]
            );

            $attendances->push($attendance);
        }

        return $attendances;
    }

    /**
     * Get attendance rate for a student.
     */
    public function getStudentAttendanceRate(int $studentId, ?string $from = null, ?string $to = null): float
    {
        $query = Attendance::where('student_id', $studentId);

        if ($from) $query->where('date', '>=', $from);
        if ($to) $query->where('date', '<=', $to);

        $total = $query->count();
        if ($total === 0) return 0;

        $present = (clone $query)->whereIn('status', ['present', 'late'])->count();

        return round(($present / $total) * 100, 2);
    }

    /**
     * Get attendance summary for a class on a given date.
     */
    public function getClassAttendanceSummary(int $classId, string $date): array
    {
        $records = Attendance::where('class_id', $classId)->where('date', $date)->get();

        return [
            'total'   => $records->count(),
            'present' => $records->where('status', 'present')->count(),
            'absent'  => $records->where('status', 'absent')->count(),
            'late'    => $records->where('status', 'late')->count(),
            'excused' => $records->where('status', 'excused')->count(),
        ];
    }
}
