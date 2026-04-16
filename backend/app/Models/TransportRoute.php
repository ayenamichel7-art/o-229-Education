<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportRoute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'vehicle_reg',
        'driver_name',
        'driver_phone',
        'capacity',
        'monthly_cost',
        'is_active',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(TransportSubscription::class, 'route_id');
    }

    public function students()
    {
        return $this->hasManyThrough(Student::class, TransportSubscription::class, 'route_id', 'id', 'id', 'student_id');
    }
}
