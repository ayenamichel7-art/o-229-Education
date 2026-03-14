<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MobileApp extends Model
{
    use HasFactory;

    protected $fillable = [
        'app_name',
        'package_name',
        'version',
        'status',
        'config',
        'icon_url',
        'splash_url',
        'apk_url',
        'ios_url',
        'last_build_at',
    ];

    protected $casts = [
        'config' => 'array',
        'last_build_at' => 'datetime',
    ];
}
