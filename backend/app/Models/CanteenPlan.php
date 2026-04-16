<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CanteenPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'cost_per_month',
        'is_active',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(CanteenSubscription::class, 'plan_id');
    }
}
