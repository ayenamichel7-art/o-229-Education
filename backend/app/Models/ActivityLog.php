<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ActivityLog — Robot Audit Trail
 *
 * Records every action performed on the platform.
 * Used by the Auditable trait and Login/Logout middleware.
 */
class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'performed_at',
    ];

    protected $casts = [
        'old_values'   => 'array',
        'new_values'   => 'array',
        'performed_at' => 'datetime',
    ];

    // ─── Relationships ───────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes ──────────────────────────────────────────

    public function scopeForEntity($query, string $entityType, int $entityId)
    {
        return $query->where('entity_type', $entityType)->where('entity_id', $entityId);
    }

    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('performed_at', today());
    }

    public function scopeLastDays($query, int $days)
    {
        return $query->where('performed_at', '>=', now()->subDays($days));
    }
}
