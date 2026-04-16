<?php

namespace App\Models;

use App\Models\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'student_id',
        'exam_id',
        'subject_id',
        'class_id',
        'academic_year_id',
        'term',        // 1, 2, 3
        'score',
        'max_score',
        'grade_letter', // A, B, C, D, F
        'comment',
        'recorded_by',
    ];

    protected $casts = [
        'score'     => 'decimal:2',
        'max_score' => 'decimal:2',
        'term'      => 'integer',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /**
     * Calculate percentage.
     */
    public function getPercentageAttribute(): float
    {
        return $this->max_score > 0 ? round(($this->score / $this->max_score) * 100, 2) : 0;
    }
}
