<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'coefficient',
        'is_active',
    ];

    protected $casts = [
        'coefficient' => 'decimal:1',
        'is_active'   => 'boolean',
    ];
}
