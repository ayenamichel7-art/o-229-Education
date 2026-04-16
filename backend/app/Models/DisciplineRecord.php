<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisciplineRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'recorded_by',
        'category',
        'reason',
        'description',
        'points',
        'sanction_type',
        'incident_date',
        'notified_parents',
    ];

    protected $casts = [
        'incident_date'    => 'date',
        'notified_parents' => 'boolean',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
