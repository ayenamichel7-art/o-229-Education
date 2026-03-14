<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',           // "Inscription 2025-2026"
        'description',
        'academic_year_id',
        'is_active',
        'requires_payment',
        'registration_fee',
        'starts_at',
        'ends_at',
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'requires_payment' => 'boolean',
        'registration_fee' => 'decimal:2',
        'starts_at'        => 'datetime',
        'ends_at'          => 'datetime',
    ];

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class);
    }

    public function isOpen(): bool
    {
        return $this->is_active
            && (! $this->starts_at || $this->starts_at->isPast())
            && (! $this->ends_at || $this->ends_at->isFuture());
    }
}
