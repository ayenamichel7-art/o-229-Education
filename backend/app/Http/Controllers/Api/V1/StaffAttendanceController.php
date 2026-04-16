<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StaffAttendance;
use App\Models\User;
use App\Models\Teacher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffAttendanceController extends Controller
{
    /**
     * Get monitoring dashboard for administrators.
     */
    public function index(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        // Get all staff (Teachers + Admin users)
        $staff = User::whereIn('role', ['teacher', 'admin', 'staff'])->get();

        $attendances = StaffAttendance::where('date', $date)
            ->get()
            ->keyBy('user_id');

        $data = $staff->map(function ($user) use ($attendances) {
            $record = $attendances->get($user->id);
            return [
                'user_id'   => $user->id,
                'name'      => $user->getFullNameAttribute(),
                'role'      => $user->role,
                'status'    => $record ? $record->status : 'absent',
                'check_in'  => $record ? $record->check_in : null,
                'check_out' => $record ? $record->check_out : null,
                'remarks'   => $record ? $record->remarks : '',
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * Self Check-in/out for teachers (Mobile/Web).
     */
    public function checkInOut(Request $request): JsonResponse
    {
        $user = auth()->user();
        $date = now()->toDateString();
        $time = now()->toTimeString();

        $attendance = StaffAttendance::firstOrCreate(
            ['user_id' => $user->id, 'date' => $date],
            ['status' => 'present']
        );

        if (!$attendance->check_in) {
            $attendance->update([
                'check_in' => $time,
                'location_lat' => $request->lat,
                'location_long' => $request->long,
            ]);
            return response()->json(['message' => 'Pointage d\'arrivée enregistré à ' . $time]);
        }

        $attendance->update(['check_out' => $time]);
        return response()->json(['message' => 'Pointage de départ enregistré à ' . $time]);
    }

    /**
     * Admin manually updating a staff status.
     */
    public function update(Request $request, $userId): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:present,absent,late,half-day',
            'date'   => 'required|date',
        ]);

        StaffAttendance::updateOrCreate(
            ['user_id' => $userId, 'date' => $request->date],
            ['status' => $request->status, 'remarks' => $request->remarks]
        );

        return response()->json(['message' => 'Statut du personnel mis à jour.']);
    }
}
