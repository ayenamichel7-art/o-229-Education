<?php

namespace App\Models\Traits;

use App\Models\ActivityLog;

/**
 * Auditable — Robot Audit Trail
 *
 * Apply this trait to any model you want to track.
 * It will log every create, update, and delete action.
 */
trait Auditable
{
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            static::logActivity($model, 'created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $original = $model->getOriginal();
            $changes  = $model->getChanges();

            // Remove timestamps from diff
            unset($changes['updated_at'], $original['updated_at']);

            if (! empty($changes)) {
                $oldValues = array_intersect_key($original, $changes);
                static::logActivity($model, 'updated', $oldValues, $changes);
            }
        });

        static::deleted(function ($model) {
            static::logActivity($model, 'deleted', $model->getAttributes(), null);
        });
    }

    protected static function logActivity($model, string $action, ?array $oldValues, ?array $newValues): void
    {
        // Skip if no authenticated user (e.g., seeders, migrations)
        if (! auth()->check()) {
            return;
        }

        ActivityLog::create([
            'user_id'      => auth()->id(),
            'action'       => $action,
            'entity_type'  => get_class($model),
            'entity_id'    => $model->getKey(),
            'old_values'   => $oldValues,
            'new_values'   => $newValues,
            'ip_address'   => request()?->ip(),
            'user_agent'   => request()?->userAgent(),
            'performed_at' => now(),
        ]);
    }
}
