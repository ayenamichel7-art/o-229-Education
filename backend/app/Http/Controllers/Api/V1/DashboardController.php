<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\KpiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected KpiService $kpiService
    ) {}

    /**
     * Get all KPIs for the admin dashboard.
     */
    public function kpis(Request $request): JsonResponse
    {
        $academicYearId = $request->query('academic_year_id');

        $kpis = $this->kpiService->getDashboardKpis($academicYearId);
        $tenant = resolve('current_tenant');

        return response()->json([
            'data' => $kpis,
            'meta' => [
                'google_business_status' => [
                    'configured' => $tenant->isGoogleBusinessConfigured(),
                    'message' => $tenant->isGoogleBusinessConfigured() 
                        ? 'Votre fiche Google Business est configurée.' 
                        : 'Action requise : Veuillez configurer votre fiche Google My Business pour afficher votre localisation.',
                    'action_url' => '/settings/vitrine' // Hypothétique lien vers les réglages
                ]
            ]
        ]);
    }

    /**
     * Get enrollment KPIs only.
     */
    public function enrollment(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->kpiService->getEnrollmentKpis($request->query('academic_year_id')),
        ]);
    }

    /**
     * Get financial KPIs only.
     */
    public function financial(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->kpiService->getFinancialKpis($request->query('academic_year_id')),
        ]);
    }
}
