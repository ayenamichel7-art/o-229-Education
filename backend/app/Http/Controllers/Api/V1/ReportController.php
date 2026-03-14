<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\ExportReportJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * List generated reports from the database.
     * Reports are stored as files in storage and tracked via activity logs.
     */
    public function index(Request $request): JsonResponse
    {
        $tenantId = resolve('current_tenant_id');

        // Build query for reports from files in storage
        $reports = \App\Models\ActivityLog::where('entity_type', 'Report')
            ->orderByDesc('performed_at')
            ->paginate($request->get('per_page', 15));

        // Also check for any ongoing report generation jobs
        $pendingJobs = \DB::table('jobs')
            ->where('queue', 'reports')
            ->count();

        return response()->json([
            'data' => $reports->map(function ($log) {
                return [
                    'id'           => $log->id,
                    'title'        => $log->new_values['title'] ?? 'Rapport #' . $log->entity_id,
                    'type'         => $log->new_values['type'] ?? 'Général',
                    'generated_by' => $log->user?->full_name ?? 'Robot Automatique',
                    'status'       => $log->new_values['status'] ?? 'completed',
                    'created_at'   => $log->performed_at,
                    'file_url'     => $log->new_values['file_url'] ?? null,
                ];
            }),
            'meta' => [
                'current_page'  => $reports->currentPage(),
                'last_page'     => $reports->lastPage(),
                'per_page'      => $reports->perPage(),
                'total'         => $reports->total(),
                'pending_jobs'  => $pendingJobs,
            ],
        ]);
    }

    /**
     * Generate a new report (dispatches a background job).
     */
    public function generate(Request $request): JsonResponse
    {
        $request->validate([
            'type' => 'required|string|in:financial,academic,attendance,analytical',
            'title' => 'nullable|string|max:255',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
        ]);

        $tenantId = resolve('current_tenant_id');

        $title = $request->title ?? match ($request->type) {
            'financial'  => 'Rapport Financier — ' . now()->translatedFormat('F Y'),
            'academic'   => 'Rapport Académique — ' . now()->translatedFormat('F Y'),
            'attendance' => 'Rapport de Présence — Semaine ' . now()->weekOfYear,
            'analytical' => 'Bilan Analytique — ' . now()->translatedFormat('F Y'),
        };

        // Log the report generation request
        \App\Models\ActivityLog::create([
            'tenant_id'    => $tenantId,
            'user_id'      => $request->user()->id,
            'action'       => 'created',
            'entity_type'  => 'Report',
            'entity_id'    => 0,
            'performed_at' => now(),
            'ip_address'   => $request->ip(),
            'user_agent'   => $request->userAgent(),
            'new_values'   => [
                'title'  => $title,
                'type'   => $request->type,
                'status' => 'processing',
            ],
        ]);

        // Dispatch background job for heavy report generation
        // ExportReportJob(int $tenantId, int $userId, string $reportType, string $format, array $filters)
        ExportReportJob::dispatch(
            $tenantId, 
            $request->user()->id, 
            $request->type, 
            'pdf', 
            ['title' => $title]
        )->onQueue('reports');

        return response()->json([
            'message' => 'Rapport en cours de génération. Vous serez notifié.',
            'title'   => $title,
        ], 202);
    }

    /**
     * Get available report types with metadata.
     */
    public function types(): JsonResponse
    {
        return response()->json([
            'data' => [
                [
                    'type' => 'financial',
                    'label' => 'Rapport Financier',
                    'description' => 'Résumé des paiements, impayés et revenus',
                    'icon' => 'banknote',
                ],
                [
                    'type' => 'academic',
                    'label' => 'Rapport Académique',
                    'description' => 'Notes, moyennes et classements par classe',
                    'icon' => 'graduation-cap',
                ],
                [
                    'type' => 'attendance',
                    'label' => 'Rapport de Présence',
                    'description' => 'Taux de présence, absences et retards',
                    'icon' => 'calendar-check',
                ],
                [
                    'type' => 'analytical',
                    'label' => 'Bilan Analytique',
                    'description' => 'Vue d\'ensemble et tendances',
                    'icon' => 'bar-chart-3',
                ],
            ],
        ]);
    }
}
