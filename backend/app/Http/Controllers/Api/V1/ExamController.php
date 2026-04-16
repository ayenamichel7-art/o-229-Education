<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Exam;
use App\Models\Grade;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExamController extends Controller
{
    public function __construct()
    {
        // Only teachers and admins can manage exams
        $this->middleware(function ($request, $next) {
            if (!$request->user()?->hasAnyRole(['admin', 'teacher'])) {
                abort(403, 'Accès réservé aux enseignants et administrateurs.');
            }
            return $next($request);
        });
    }

    public function index(Request $request): JsonResponse
    {
        $classId = $request->query('class_id');
        $subjectId = $request->query('subject_id');

        $exams = Exam::with(['subject', 'schoolClass', 'teacher'])
            ->when($classId, fn($q) => $q->where('class_id', $classId))
            ->when($subjectId, fn($q) => $q->where('subject_id', $subjectId))
            ->orderBy('date', 'desc')
            ->get();

        return response()->json(['data' => $exams]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:100',
            'type'             => 'required|in:test,exam,quiz,homework',
            'date'             => 'required|date',
            'class_id'         => 'required|exists:school_classes,id',
            'subject_id'       => 'required|exists:subjects,id',
            'teacher_id'       => 'required|exists:teachers,id',
            'academic_year_id' => 'required|exists:academic_years,id',
            'term'             => 'required|integer|min:1|max:3',
            'max_score'        => 'required|numeric|min:0',
            'weight'           => 'required|numeric|min:0',
            'description'      => 'nullable|string',
        ]);

        $exam = Exam::create($validated);

        return response()->json([
            'message' => 'Évaluation créée avec succès.',
            'data'    => $exam->load(['subject', 'schoolClass'])
        ], 201);
    }

    public function show(Exam $exam): JsonResponse
    {
        return response()->json([
            'data' => $exam->load(['subject', 'schoolClass', 'teacher', 'grades.student.user'])
        ]);
    }

    /**
     * Bulk enter grades for an exam.
     */
    public function enterResults(Request $request, Exam $exam): JsonResponse
    {
        $validated = $request->validate([
            'results'           => 'required|array',
            'results.*.student_id' => 'required|exists:students,id',
            'results.*.score'      => 'required|numeric|min:0|max:' . $exam->max_score,
            'results.*.comment'    => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($exam, $validated) {
            foreach ($validated['results'] as $result) {
                Grade::updateOrCreate(
                    [
                        'exam_id'    => $exam->id,
                        'student_id' => $result['student_id'],
                    ],
                    [
                        'subject_id'       => $exam->subject_id,
                        'class_id'         => $exam->class_id,
                        'academic_year_id' => $exam->academic_year_id,
                        'term'             => $exam->term,
                        'score'            => $result['score'],
                        'max_score'        => $exam->max_score,
                        'comment'          => $result['comment'] ?? null,
                        'recorded_by'      => auth()->id(),
                    ]
                );
            }

            $exam->update(['status' => 'results_entered']);
        });

        return response()->json([
            'message' => 'Notes enregistrées avec succès.'
        ]);
    }

    public function publish(Exam $exam): JsonResponse
    {
        $exam->update(['status' => 'published']);
        // Here we could trigger notifications for parents
        return response()->json(['message' => 'Résultats publiés. Les parents peuvent désormais les consulter.']);
    }

    public function destroy(Exam $exam): JsonResponse
    {
        $exam->delete();
        return response()->json(['message' => 'Évaluation supprimée.']);
    }
}
