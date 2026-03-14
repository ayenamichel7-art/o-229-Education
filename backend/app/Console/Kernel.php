<?php

namespace App\Console;

use App\Jobs\ExportReportJob;
use App\Jobs\PaymentAlertJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * The Robot: Automated tasks that run on schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // ─── Nightly: Check overdue payments & alert admins ──
        $schedule->job(new PaymentAlertJob(), 'high')
            ->dailyAt('06:00')
            ->withoutOverlapping()
            ->onOneServer()
            ->appendOutputTo(storage_path('logs/robot-payment-alerts.log'));

        // ─── Weekly: Generate attendance reports ─────────────
        // Auto-generates for all tenants every Sunday at 23:00
        $schedule->call(function () {
            $tenants = \App\Models\Tenant::where('is_active', true)->get();
            foreach ($tenants as $tenant) {
                $admin = \App\Models\User::where('tenant_id', $tenant->id)
                    ->role('admin-school')
                    ->first();

                if ($admin) {
                    ExportReportJob::dispatch(
                        $tenant->id,
                        $admin->id,
                        'attendance',
                        'excel',
                    );
                }
            }
        })->weeklyOn(0, '23:00')
            ->name('robot:weekly-attendance-reports')
            ->withoutOverlapping();

        // ─── Monthly: Financial summary reports ──────────────
        $schedule->call(function () {
            $tenants = \App\Models\Tenant::where('is_active', true)->get();
            foreach ($tenants as $tenant) {
                $admin = \App\Models\User::where('tenant_id', $tenant->id)
                    ->role('admin-school')
                    ->first();

                if ($admin) {
                    ExportReportJob::dispatch(
                        $tenant->id,
                        $admin->id,
                        'financial',
                        'pdf',
                    );
                }
            }
        })->monthlyOn(1, '01:00')
            ->name('robot:monthly-financial-reports')
            ->withoutOverlapping();

        // ─── Daily: Clean old activity logs (older than 1 year) ─
        $schedule->call(function () {
            \App\Models\ActivityLog::withoutGlobalScopes()
                ->where('performed_at', '<', now()->subYear())
                ->delete();
        })->dailyAt('03:00')
            ->name('robot:cleanup-activity-logs');

        // ─── Laravel internal ────────────────────────────────
        $schedule->command('queue:prune-batches --hours=48')->daily();
        $schedule->command('sanctum:prune-expired --hours=24')->daily();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
