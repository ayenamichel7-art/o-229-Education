<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentInteraction extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'staff_id',
        'type', // call, email, meeting, sms, other
        'interaction_date',
        'notes',
        'status', // completed, scheduled
    ];

    protected $casts = [
        'interaction_date' => 'datetime',
        'notes' => 'encrypted', // RGPD : les notes sur les comportements des parents sont sensibles
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }
}
