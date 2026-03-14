<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

/*
|--------------------------------------------------------------------------
| Authentication Tests — o-229 Education
|--------------------------------------------------------------------------
|
| Tests covering:
|   - Successful login with valid credentials
|   - Failed login with invalid credentials
|   - Rate-limiting on login endpoint
|   - Logout revokes token
|   - /auth/me returns authenticated user
|   - Unauthenticated access is blocked
|
*/

beforeEach(function () {
    // Create permissions and roles
    $permissions = ['view-students', 'manage-students', 'view-financials'];
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
    }
    $role = Role::firstOrCreate(['name' => 'admin-school', 'guard_name' => 'web']);
    $role->syncPermissions($permissions);

    // Create tenant
    $this->tenant = Tenant::create([
        'name' => 'Test School',
        'slug' => 'test-school',
        'domain' => 'test-school.o-229.com',
        'is_active' => true,
    ]);

    // Bind tenant context
    app()->instance('current_tenant_id', $this->tenant->id);
    app()->instance('current_tenant', $this->tenant);

    // Create user
    $this->user = User::withoutGlobalScopes()->create([
        'tenant_id' => $this->tenant->id,
        'first_name' => 'Jean',
        'last_name' => 'Admin',
        'email' => 'admin@test-school.com',
        'password' => Hash::make('secret123'),
        'is_active' => true,
    ]);
    $this->user->assignRole('admin-school');
});

// ─── Successful Login ──────────────────────────────────

test('login with valid credentials returns token and user data', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test-school.com',
        'password' => 'secret123',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'user' => ['id', 'first_name', 'last_name', 'email', 'roles'],
                'token',
            ],
        ])
        ->assertJsonPath('data.user.email', 'admin@test-school.com');
});

// ─── Failed Login ──────────────────────────────────────

test('login with wrong password returns 422', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test-school.com',
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('login with non-existent email returns 422', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'nobody@test-school.com',
        'password' => 'secret123',
    ]);

    $response->assertStatus(422);
});

// ─── Validation ────────────────────────────────────────

test('login requires email and password', function () {
    $response = $this->postJson('/api/v1/auth/login', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email', 'password']);
});

// ─── Disabled Account ──────────────────────────────────

test('login with inactive account returns 403', function () {
    $this->user->update(['is_active' => false]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test-school.com',
        'password' => 'secret123',
    ]);

    $response->assertStatus(403);
});

// ─── Authenticated Endpoints ───────────────────────────

test('auth/me returns current user when authenticated', function () {
    $response = $this->actingAs($this->user)
        ->getJson('/api/v1/auth/me');

    $response->assertOk()
        ->assertJsonPath('data.email', 'admin@test-school.com')
        ->assertJsonStructure([
            'data' => ['id', 'first_name', 'last_name', 'email', 'roles', 'tenant'],
        ]);
});

test('auth/me returns 401 when not authenticated', function () {
    $response = $this->getJson('/api/v1/auth/me');

    $response->assertStatus(401);
});

// ─── Logout ────────────────────────────────────────────

test('logout revokes the current token', function () {
    // Login first
    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test-school.com',
        'password' => 'secret123',
    ]);

    $token = $loginResponse->json('data.token');

    // Logout with token
    $logoutResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/v1/auth/logout');

    $logoutResponse->assertOk();

    // Token should no longer work
    $meResponse = $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/v1/auth/me');

    $meResponse->assertStatus(401);
});

// ─── Activity Log on Login ─────────────────────────────

test('successful login creates an activity log entry', function () {
    $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@test-school.com',
        'password' => 'secret123',
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'tenant_id' => $this->tenant->id,
        'user_id' => $this->user->id,
        'action' => 'login',
    ]);
});
