<?php

namespace App\Models;

use App\Models\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, Auditable, SoftDeletes;

    protected $fillable = [
        'student_id',
        'academic_year_id',
        'amount',
        'amount_paid',
        'due_date',
        'paid_at',
        'payment_method', // cash, bank_transfer, mobile_money, card
        'reference_number',
        'external_id',
        'gateway_response',
        'payment_url',
        'receipt_url',
        'type',    // tuition, registration, exam, transport, uniform, other
        'status',  // pending, partial, paid, overdue, cancelled
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'due_date'    => 'date',
        'paid_at'     => 'datetime',
    ];

    // ─── Relationships ───────────────────────────────────

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // ─── Helpers ─────────────────────────────────────────

    public function getBalanceAttribute(): float
    {
        return $this->amount - $this->amount_paid;
    }

    public function isOverdue(): bool
    {
        return $this->status !== 'paid'
            && $this->due_date
            && $this->due_date->isPast();
    }
}
