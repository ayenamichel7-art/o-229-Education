<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ReportPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view reports.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director', 'accountant']);
    }

    /**
     * Determine if the user can view a specific report.
     */
    public function view(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director', 'accountant']);
    }

    /**
     * Determine if the user can generate reports.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director']);
    }
}
