<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alumni extends Model
{
    use HasFactory;

    protected $table = 'alumnis';

    protected $fillable = [
        'user_id',
        'graduation_year',
        'current_company',
        'position',
        'linkedin_url',
        'testimonial',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'graduation_year' => 'integer',
    ];

    /**
     * Get the user that is the alumni
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
