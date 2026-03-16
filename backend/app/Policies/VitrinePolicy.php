<?php

namespace App\Policies;

use App\Models\LandingPage;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class VitrinePolicy
{
    use HandlesAuthorization;

    /**
     * Anyone can view vitrines (public facing).
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Anyone can view a specific vitrine page.
     */
    public function view(?User $user, LandingPage $page): bool
    {
        return true;
    }

    /**
     * Only admins and directors can create vitrine pages.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director']);
    }

    /**
     * Only admins and directors can update vitrine pages.
     */
    public function update(User $user, LandingPage $page): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director']);
    }

    /**
     * Only super-admin and admin can delete vitrine pages.
     */
    public function delete(User $user, LandingPage $page): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
