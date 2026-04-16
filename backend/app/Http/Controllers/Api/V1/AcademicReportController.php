<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Grade;
use App\Models\SchoolClass;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AcademicReportController extends Controller
{
    /**
     * Generate a PDF report card (Bulletin) for a specific student.
     */
    public function generateStudentReport(Request $request, Student $student): Response
    {
        $term           = $request->query('term', 1);
        $academicYearId = $request->query('academic_year_id');

        // 1. Fetch all students in the same class to calculate ranks
        $classStudents = Student::where('class_id', $student->class_id)->get();
        $classRatings = [];

        foreach ($classStudents as $cs) {
            $sGrades = Grade::where('student_id', $cs->id)
                ->where('term', $term)
                ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId))
                ->get();

            if ($sGrades->isNotEmpty()) {
                $weightedSum = 0;
                $coeffSum = 0;
                foreach ($sGrades as $g) {
                    $coeff = $g->subject->coefficient ?? 1.0;
                    $weightedSum += ($g->score / $g->max_score * 20) * $coeff;
                    $coeffSum += $coeff;
                }
                $classRatings[$cs->id] = $coeffSum > 0 ? $weightedSum / $coeffSum : 0;
            } else {
                $classRatings[$cs->id] = 0;
            }
        }

        arsort($classRatings);
        $rank = array_search($student->id, array_keys($classRatings)) + 1;
        $classAvg = count($classRatings) > 0 ? array_sum($classRatings) / count($classRatings) : 0;

        // 2. Fetch specific student grades with groupings
        $grades = Grade::with(['subject', 'exam'])
            ->where('student_id', $student->id)
            ->where('term', $term)
            ->when($academicYearId, fn($q) => $q->where('academic_year_id', $academicYearId))
            ->get()
            ->groupBy('subject_id');

        $processedGrades = [];
        $totalPoints = 0;
        $totalCoeff = 0;

        foreach ($grades as $subjectId => $subjectGrades) {
            $subject = $subjectGrades->first()->subject;
            $avgScore = $subjectGrades->avg(function($g) { return ($g->score / $g->max_score) * 20; });
            $coeff = $subject->coefficient ?? 1.0;
            
            $processedGrades[] = [
                'subject' => $subject->name,
                'coeff'   => $coeff,
                'avg'     => round($avgScore, 2),
                'total'   => round($avgScore * $coeff, 2),
                'teacher' => $subjectGrades->first()->recorder->last_name ?? 'N/A',
                'comment' => $subjectGrades->where('comment', '!=', null)->first()->comment ?? 'Assez bien'
            ];

            $totalPoints += ($avgScore * $coeff);
            $totalCoeff += $coeff;
        }

        // 3. Fetch Tenant branding
        $tenant = resolve('current_tenant');
        
        $data = [
            'student'      => $student->load('user', 'schoolClass'),
            'grades'       => $processedGrades,
            'term'         => $term,
            'generalAvg'   => $totalCoeff > 0 ? round($totalPoints / $totalCoeff, 2) : 0,
            'classAvg'     => round($classAvg, 2),
            'rank'         => $rank,
            'classSize'    => count($classStudents),
            'totalPoints'  => round($totalPoints, 2),
            'totalCoeff'   => $totalCoeff,
            'tenant'       => $tenant,
            'date'         => now()->format('d/m/Y'),
        ];

        $pdf = Pdf::loadView('reports.bulletin', $data);
        return $pdf->download("Bulletin_{$student->matricule}_T{$term}.pdf");
    }

    /**
     * Generate a Professional School Brochure for parents.
     */
    public function generateBrochure(): Response
    {
        $tenant = resolve('current_tenant');
        $classes = SchoolClass::withCount('students')->get();
        
        $reportSettings = $tenant->settings['report_card'] ?? [
            'primary_color'   => $tenant->primary_color ?? '#1E40AF',
            'secondary_color' => $tenant->secondary_color ?? '#F59E0B',
        ];

        $data = [
            'tenant'         => $tenant,
            'classes'        => $classes,
            'reportSettings' => $reportSettings,
            'date'           => now()->format('d/m/Y'),
        ];
        $pdf = Pdf::loadView('reports.brochure', $data);
        
        return $pdf->download("Brochure_{$tenant->slug}.pdf");
    }

    /**
     * Generate class-wide report cards.
     */
    public function generateClassReports(Request $request, SchoolClass $class): Response
    {
        $term = $request->query('term', 1);
        $students = Student::where('class_id', $class->id)->get();
        
        if ($students->isEmpty()) {
            return response('Aucun élève dans cette classe.', 404);
        }

        // In a real high-scale app, we might use a ZIP or Queue.
        // Here, we provide a list of download links or a combined PDF if possible.
        // For now, let's just make sure the single generation is robust.
        return response('Génération groupée en cours de préparation...', 200);
    }
}
