<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DisciplineRecord;
use App\Models\Student;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DisciplineController extends Controller
{
    public function __construct()
    {
        // Only teachers and admins can manage discipline records
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasAnyRole(['admin', 'teacher'])) {
                abort(403, 'Accès réservé aux enseignants et administrateurs.');
            }
            return $next($request);
        });
    }

    /**
     * Display a listing of discipline records.
     */
    public function index(Request $request): JsonResponse
    {
        $records = DisciplineRecord::with(['student.user', 'recorder'])
            ->orderBy('incident_date', 'desc')
            ->paginate(15);
            
        return response()->json($records);
    }

    /**
     * Store a newly created discipline record.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id'      => 'required|exists:students,id',
            'category'        => 'required|in:merit,demerit,sanction',
            'reason'          => 'required|string|max:255',
            'description'     => 'nullable|string',
            'points'          => 'nullable|integer',
            'sanction_type'   => 'nullable|string',
            'incident_date'   => 'required|date',
            'notify_parents'  => 'required|boolean',
        ]);

        $record = DisciplineRecord::create([
            'student_id'      => $validated['student_id'],
            'recorded_by'     => auth()->id(),
            'category'        => $validated['category'],
            'reason'          => $validated['reason'],
            'description'     => $validated['description'] ?? null,
            'points'          => $validated['points'] ?? 0,
            'sanction_type'   => $validated['sanction_type'] ?? null,
            'incident_date'   => $validated['incident_date'],
            'notified_parents' => $validated['notify_parents'],
        ]);

        if ($validated['notify_parents']) {
            $this->notifyParents($record);
        }

        return response()->json([
            'message' => 'Record de discipline enregistré avec succès.',
            'data' => $record->load('student.user')
        ], 201);
    }

    /**
     * Internal method to notify parents about discipline record.
     */
    protected function notifyParents(DisciplineRecord $record)
    {
        $student = Student::with('user')->find($record->student_id);
        if (!$student) return;

        $typeLabel = $record->category === 'merit' ? 'MÉRITE' : 'SANCTION';
        $message = "📢 Rappel de Discipline [O-229] : ";
        
        if ($record->category === 'merit') {
            $message .= "Félicitations ! Un mérite a été attribué à {$student->user->full_name} pour : {$record->reason}.";
        } else {
            $message .= "Une notification de discipline ({$record->category}) a été enregistrée pour {$student->user->full_name}. Motif : {$record->reason}.";
            if ($record->sanction_type) {
                $message .= " Sanction : {$record->sanction_type}.";
            }
        }

        $phone = $student->guardian_phone ?? ($student->user->phone ?? null);
        
        if ($phone) {
            app(SmsService::class)->send($phone, $message);
        }
    }
}
