<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login — returns Sanctum token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $tenantId = resolve('current_tenant_id');

        $user = User::withoutGlobalScopes()
            ->when($tenantId, fn($q) => $q->where('tenant_id', $tenantId))
            ->where('email', $request->email)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            // Log failed attempt for Fail2Ban / security monitoring
            Log::warning('Failed login attempt', [
                'ip'    => $request->ip(),
                'email' => $request->email,
                'agent' => $request->userAgent(),
            ]);

            throw ValidationException::withMessages([
                'email' => ['Les informations d\'identification fournies sont incorrectes.'],
            ]);
        }

        if (! $user->is_active) {
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }

        // Update last login
        $user->update(['last_login_at' => now()]);

        // Log login activity
        ActivityLog::withoutGlobalScopes()->create([
            'tenant_id'    => $user->tenant_id,
            'user_id'      => $user->id,
            'action'       => 'login',
            'entity_type'  => User::class,
            'entity_id'    => $user->id,
            'ip_address'   => $request->ip(),
            'user_agent'   => $request->userAgent(),
            'performed_at' => now(),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'data' => [
                'user'  => [
                    'id'         => $user->id,
                    'first_name' => $user->first_name,
                    'last_name'  => $user->last_name,
                    'email'      => $user->email,
                    'roles'      => $user->getRoleNames(),
                    'permissions'=> $user->getAllPermissions()->pluck('name'),
                ],
                'token' => $token,
            ],
        ]);
    }

    /**
     * Logout — revoke current token.
     */
    public function logout(Request $request): JsonResponse
    {
        // Log logout activity
        ActivityLog::withoutGlobalScopes()->create([
            'tenant_id'    => $request->user()->tenant_id,
            'user_id'      => $request->user()->id,
            'action'       => 'logout',
            'entity_type'  => User::class,
            'entity_id'    => $request->user()->id,
            'ip_address'   => $request->ip(),
            'user_agent'   => $request->userAgent(),
            'performed_at' => now(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * Get authenticated user profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('tenant');

        return response()->json([
            'data' => [
                'id'          => $user->id,
                'first_name'  => $user->first_name,
                'last_name'   => $user->last_name,
                'email'       => $user->email,
                'phone'       => $user->phone,
                'avatar_url'  => $user->avatar_url,
                'roles'       => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
                'tenant'      => $user->tenant->getBrandingConfig(),
            ],
        ]);
    }
}
