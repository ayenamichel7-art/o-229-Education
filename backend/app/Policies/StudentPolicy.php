<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;

/**
 * StudentPolicy — OMI Cross-Tenant Isolation
 *
 * Every policy MUST check: resource->tenant_id === user->tenant_id
 */
class StudentPolicy
{
    /**
     * Can the user view a list of students (same tenant)?
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-students');
    }

    /**
     * Can the user view this specific student?
     */
    public function view(User $user, Student $student): bool
    {
        return $user->tenant_id === $student->tenant_id
            && $user->hasPermissionTo('view-students');
    }

    /**
     * Can the user create students?
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage-students');
    }

    /**
     * Can the user update this student?
     */
    public function update(User $user, Student $student): bool
    {
        return $user->tenant_id === $student->tenant_id
            && $user->hasPermissionTo('manage-students');
    }

    /**
     * Can the user delete this student?
     */
    public function delete(User $user, Student $student): bool
    {
        return $user->tenant_id === $student->tenant_id
            && $user->hasPermissionTo('manage-students');
    }
}
