<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Student;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    /**
     * Record a new payment.
     */
    public function recordPayment(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            $payment = Payment::create([
                'student_id'       => $data['student_id'],
                'academic_year_id' => $data['academic_year_id'] ?? null,
                'amount'           => $data['amount'],
                'amount_paid'      => $data['amount_paid'] ?? 0,
                'due_date'         => $data['due_date'] ?? null,
                'payment_method'   => $data['payment_method'] ?? null,
                'type'             => $data['type'] ?? 'tuition',
                'status'           => 'pending',
                'notes'            => $data['notes'] ?? null,
                'recorded_by'      => auth()->id(),
            ]);

            // Auto-set status based on amount_paid
            if ($payment->amount_paid >= $payment->amount) {
                $payment->update(['status' => 'paid', 'paid_at' => now()]);
            } elseif ($payment->amount_paid > 0) {
                $payment->update(['status' => 'partial']);
            }

            return $payment;
        });
    }

    /**
     * Process a payment installment.
     */
    public function processInstallment(Payment $payment, float $amount, string $method): Payment
    {
        return DB::transaction(function () use ($payment, $amount, $method) {
            $newAmountPaid = $payment->amount_paid + $amount;

            $payment->update([
                'amount_paid'    => $newAmountPaid,
                'payment_method' => $method,
                'status'         => $newAmountPaid >= $payment->amount ? 'paid' : 'partial',
                'paid_at'        => $newAmountPaid >= $payment->amount ? now() : null,
            ]);

            return $payment->fresh();
        });
    }

    /**
     * Get overdue payments for a tenant.
     */
    public function getOverduePayments(): Collection
    {
        return Payment::where('status', '!=', 'paid')
            ->where('due_date', '<', now())
            ->with('student.user')
            ->get();
    }

    /**
     * Generate financial summary for a tenant.
     */
    public function getFinancialSummary(?int $academicYearId = null): array
    {
        $query = Payment::query();

        if ($academicYearId) {
            $query->where('academic_year_id', $academicYearId);
        }

        return [
            'total_invoiced' => $query->sum('amount'),
            'total_collected' => $query->sum('amount_paid'),
            'total_pending' => $query->where('status', 'pending')->sum('amount'),
            'total_overdue' => (clone $query)->where('status', '!=', 'paid')
                ->where('due_date', '<', now())->sum('amount'),
            'collection_rate' => $this->calculateCollectionRate($query),
            'payment_count' => $query->count(),
        ];
    }

    protected function calculateCollectionRate($query): float
    {
        $totalAmount = $query->sum('amount');
        if ($totalAmount == 0) return 0;

        return round(($query->sum('amount_paid') / $totalAmount) * 100, 2);
    }
}
