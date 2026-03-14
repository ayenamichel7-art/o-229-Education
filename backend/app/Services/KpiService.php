<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Payment;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ActivityLog;

/**
 * KpiService — Dashboard Analytics Engine
 *
 * Calculates all KPI indicators for the admin dashboard.
 */
class KpiService
{
    /**
     * Get all KPIs for the current tenant.
     */
    public function getDashboardKpis(?int $academicYearId = null): array
    {
        return [
            'enrollment'    => $this->getEnrollmentKpis($academicYearId),
            'financial'     => $this->getFinancialKpis($academicYearId),
            'attendance'    => $this->getAttendanceKpis(),
            'staff'         => $this->getStaffKpis(),
            'activity'      => $this->getActivityKpis(),
        ];
    }

    /**
     * Enrollment KPIs.
     */
    public function getEnrollmentKpis(?int $academicYearId = null): array
    {
        $query = Student::query();
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $total = $query->count();
        $active = (clone $query)->where('status', 'active')->count();
        $newThisMonth = (clone $query)->where('enrollment_date', '>=', now()->startOfMonth())->count();

        // YoY growth
        $lastYear = Student::where('enrollment_date', '>=', now()->subYear()->startOfYear())
            ->where('enrollment_date', '<', now()->subYear()->endOfYear())
            ->count();
        $thisYear = Student::where('enrollment_date', '>=', now()->startOfYear())->count();
        $growth = $lastYear > 0 ? round((($thisYear - $lastYear) / $lastYear) * 100, 1) : 0;

        return [
            'total_students'   => $total,
            'active_students'  => $active,
            'new_this_month'   => $newThisMonth,
            'growth_yoy'       => $growth,
        ];
    }

    /**
     * Financial KPIs.
     */
    public function getFinancialKpis(?int $academicYearId = null): array
    {
        $query = Payment::query();
        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        $totalInvoiced = $query->sum('amount');
        $totalCollected = $query->sum('amount_paid');
        $collectionRate = $totalInvoiced > 0 ? round(($totalCollected / $totalInvoiced) * 100, 1) : 0;

        $overdueCount = Payment::where('status', '!=', 'paid')
            ->whereNotNull('due_date')
            ->where('due_date', '<', now())
            ->count();

        // Monthly revenue (last 12 months)
        $monthlyRevenue = Payment::selectRaw("
                TO_CHAR(paid_at, 'YYYY-MM') as month,
                SUM(amount_paid) as revenue
            ")
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', now()->subMonths(12))
            ->groupByRaw("TO_CHAR(paid_at, 'YYYY-MM')")
            ->orderByRaw("TO_CHAR(paid_at, 'YYYY-MM')")
            ->pluck('revenue', 'month')
            ->toArray();

        return [
            'total_invoiced'  => $totalInvoiced,
            'total_collected' => $totalCollected,
            'collection_rate' => $collectionRate,
            'overdue_count'   => $overdueCount,
            'monthly_revenue' => $monthlyRevenue,
        ];
    }

    /**
     * Attendance KPIs (last 30 days).
     */
    public function getAttendanceKpis(): array
    {
        $since = now()->subDays(30);

        $total = Attendance::where('date', '>=', $since)->count();
        $present = Attendance::where('date', '>=', $since)
            ->whereIn('status', ['present', 'late'])->count();
        $rate = $total > 0 ? round(($present / $total) * 100, 1) : 0;

        return [
            'attendance_rate'   => $rate,
            'total_records'     => $total,
            'absent_today'      => Attendance::where('date', today())->where('status', 'absent')->count(),
        ];
    }

    /**
     * Staff KPIs.
     */
    public function getStaffKpis(): array
    {
        return [
            'total_teachers'  => Teacher::count(),
            'active_teachers' => Teacher::where('status', 'active')->count(),
        ];
    }

    /**
     * Recent activity KPIs.
     */
    public function getActivityKpis(): array
    {
        return [
            'actions_today'     => ActivityLog::today()->count(),
            'actions_this_week' => ActivityLog::lastDays(7)->count(),
            'logins_today'      => ActivityLog::today()->byAction('login')->count(),
        ];
    }
}
