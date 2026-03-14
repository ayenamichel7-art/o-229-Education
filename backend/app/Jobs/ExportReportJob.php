<?php

namespace App\Jobs;

use App\Models\Tenant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * Robot: Export Report Job
 *
 * Generates PDF/Excel reports and stores them on disk.
 * Notifies the requesting user via WebSocket when complete.
 */
class ExportReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'reports';

    public function __construct(
        public int $tenantId,
        public int $userId,
        public string $reportType, // 'financial', 'attendance', 'grades', 'activity', 'enrollment'
        public string $format,     // 'pdf', 'excel'
        public array $filters = [],
    ) {}

    public function handle(): void
    {
        Log::info("[Robot] ExportReportJob started: {$this->reportType} ({$this->format}) for tenant {$this->tenantId}");

        app()->instance('current_tenant_id', $this->tenantId);

        try {
            $filename = $this->generateFilename();
            $content = $this->generateReport();

            // Store report
            $path = "reports/tenant-{$this->tenantId}/{$filename}";
            Storage::disk('local')->put($path, $content);

            // Log the report generation
            \App\Models\ActivityLog::withoutGlobalScopes()->create([
                'tenant_id'    => $this->tenantId,
                'user_id'      => $this->userId,
                'action'       => 'report_generated',
                'entity_type'  => 'Report',
                'entity_id'    => null,
                'new_values'   => [
                    'type'     => $this->reportType,
                    'format'   => $this->format,
                    'filename' => $filename,
                    'path'     => $path,
                ],
                'ip_address'   => null,
                'user_agent'   => 'Robot',
                'performed_at' => now(),
            ]);

            // TODO: Broadcast via Reverb to notify user
            // event(new ReportReady($this->userId, $path));

            Log::info("[Robot] Report generated: {$path}");

        } catch (\Exception $e) {
            Log::error("[Robot] ExportReportJob failed: {$e->getMessage()}");
            throw $e;
        }
    }

    protected function generateFilename(): string
    {
        $timestamp = now()->format('Y-m-d_His');
        $ext = $this->format === 'pdf' ? 'pdf' : 'xlsx';
        return "{$this->reportType}_{$timestamp}.{$ext}";
    }

    protected function generateReport(): string
    {
        // Placeholder — will be replaced with Dompdf/Laravel Excel logic
        return match ($this->reportType) {
            'financial'  => $this->generateFinancialReport(),
            'attendance' => $this->generateAttendanceReport(),
            'activity'   => $this->generateActivityReport(),
            default      => "Report: {$this->reportType}",
        };
    }

    protected function generateFinancialReport(): string
    {
        // TODO: Use Dompdf for PDF or Laravel Excel for XLSX
        $payments = \App\Models\Payment::with('student.user')->get();
        return json_encode($payments->toArray());
    }

    protected function generateAttendanceReport(): string
    {
        $records = \App\Models\Attendance::with('student.user')->get();
        return json_encode($records->toArray());
    }

    protected function generateActivityReport(): string
    {
        $logs = \App\Models\ActivityLog::with('user')
            ->lastDays($this->filters['days'] ?? 30)
            ->get();
        return json_encode($logs->toArray());
    }
}
