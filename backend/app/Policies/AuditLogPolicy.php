<?php

namespace App\Policies;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AuditLogPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view audit logs.
     * Only super-admin and admin should see the full audit trail.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    /**
     * Determine if the user can view a specific audit log entry.
     */
    public function view(User $user, ActivityLog $log): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
