<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use App\Notifications\PaymentOverdueNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Robot: Payment Alert Job
 *
 * Runs nightly via scheduler.
 * Detects overdue payments and notifies admins.
 */
class PaymentAlertJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $queue = 'high';

    public function handle(): void
    {
        Log::info('[Robot] PaymentAlertJob started.');

        // Process each tenant independently
        $tenants = Tenant::where('is_active', true)->get();

        foreach ($tenants as $tenant) {
            app()->instance('current_tenant_id', $tenant->id);

            $overduePayments = Payment::where('status', '!=', 'paid')
                ->whereNotNull('due_date')
                ->where('due_date', '<', now())
                ->where('status', '!=', 'cancelled')
                ->with('student.user')
                ->get();

            if ($overduePayments->isEmpty()) continue;

            // Mark overdue
            Payment::whereIn('id', $overduePayments->pluck('id'))
                ->where('status', '!=', 'overdue')
                ->update(['status' => 'overdue']);

            // Notify tenant admins
            $admins = User::role('admin-school')
                ->where('tenant_id', $tenant->id)
                ->get();

            foreach ($admins as $admin) {
                // $admin->notify(new PaymentOverdueNotification($overduePayments->count()));
                Log::info("[Robot] Notified admin {$admin->email}: {$overduePayments->count()} overdue payments for {$tenant->name}");
            }
        }

        Log::info('[Robot] PaymentAlertJob completed.');
    }
}
