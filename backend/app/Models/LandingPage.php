<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LandingPage extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'title',
        'content',
        'settings',
        'is_published',
        'meta_description',
    ];

    protected $casts = [
        'content' => 'array',
        'settings' => 'array',
        'is_published' => 'boolean',
    ];

    /**
     * Scope to get the primary landing page (slug = home).
     */
    public function scopeHome($query)
    {
        return $query->where('slug', 'home');
    }
}
