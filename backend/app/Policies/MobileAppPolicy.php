<?php

namespace App\Policies;

use App\Models\MobileApp;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MobileAppPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if the user can view mobile app configuration.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director']);
    }

    /**
     * Determine if the user can view a specific mobile app config.
     */
    public function view(User $user, MobileApp $app): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director']);
    }

    /**
     * Determine if the user can create/configure mobile app.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    /**
     * Determine if the user can update mobile app configuration.
     */
    public function update(User $user, MobileApp $app): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }

    /**
     * Determine if the user can request a build.
     */
    public function build(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
