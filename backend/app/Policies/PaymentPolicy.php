<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('view-financials');
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->tenant_id === $payment->tenant_id
            && $user->hasPermissionTo('view-financials');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('manage-payments');
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->tenant_id === $payment->tenant_id
            && $user->hasPermissionTo('manage-payments');
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->tenant_id === $payment->tenant_id
            && $user->hasPermissionTo('manage-payments');
    }
}
