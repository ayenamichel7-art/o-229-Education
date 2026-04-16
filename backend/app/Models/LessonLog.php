<?php

namespace App\Models;

use App\Models\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonLog extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'timetable_entry_id',
        'class_id',
        'subject_id',
        'teacher_id',
        'date',
        'topic',
        'description',
        'homework',
        'homework_due_date',
        'attachments',
    ];

    protected $casts = [
        'date'              => 'date',
        'homework_due_date' => 'date',
        'attachments'       => 'array',
    ];

    public function timetableEntry(): BelongsTo
    {
        return $this->belongsTo(TimetableEntry::class);
    }

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
}
