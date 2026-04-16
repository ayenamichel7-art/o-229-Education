<?php

namespace App\Models;

use App\Models\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'name',
        'type',
        'date',
        'class_id',
        'subject_id',
        'teacher_id',
        'academic_year_id',
        'term',
        'max_score',
        'weight',
        'status',
        'description',
    ];

    protected $casts = [
        'date'      => 'date',
        'max_score' => 'decimal:2',
        'weight'    => 'decimal:1',
        'term'      => 'integer',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }
}
