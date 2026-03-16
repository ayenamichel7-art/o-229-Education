<?php

namespace App\Policies;

use App\Models\FormTemplate;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class FormTemplatePolicy
{
    use HandlesAuthorization;

    /**
     * Anyone authenticated can view registration forms (public facing).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Anyone authenticated can view a specific form.
     */
    public function view(User $user, FormTemplate $form): bool
    {
        return true;
    }

    /**
     * Only admins can create/edit form templates.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director']);
    }

    /**
     * Only admins can update form templates.
     */
    public function update(User $user, FormTemplate $form): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin', 'director']);
    }

    /**
     * Only super-admin and admin can delete form templates.
     */
    public function delete(User $user, FormTemplate $form): bool
    {
        return $user->hasAnyRole(['super-admin', 'admin']);
    }
}
