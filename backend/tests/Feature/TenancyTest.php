<?php

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/*
|--------------------------------------------------------------------------
| Multi-Tenancy Isolation Tests — o-229 Education
|--------------------------------------------------------------------------
|
| Tests covering:
|   - Tenant creation and domain binding
|   - Data isolation between tenants
|   - Cross-tenant access prevention
|   - Feature access based on subscription plan
|   - Tenant branding configuration
|
*/

beforeEach(function () {
    // Create permissions
    $permissions = [
        'view-students', 'manage-students',
        'view-financials', 'manage-payments',
    ];
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
    }

    $adminRole = Role::firstOrCreate(['name' => 'admin-school', 'guard_name' => 'web']);
    $adminRole->syncPermissions($permissions);

    // ─── Tenant A ──────────────────────────────
    $this->tenantA = Tenant::create([
        'name'              => 'École Alpha',
        'slug'              => 'ecole-alpha',
        'is_active'         => true,
        'subscription_plan' => 'premium',
        'primary_color'     => '#1E40AF',
        'secondary_color'   => '#F59E0B',
        'currency'          => 'XOF',
        'settings'          => ['features' => ['finance' => true, 'grading' => true, 'mobile_app' => false]],
    ]);

    $this->adminA = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Admin',
        'last_name'  => 'Alpha',
        'email'      => 'admin@alpha.com',
        'password'   => Hash::make('secret123'),
        'is_active'  => true,
    ]);
    $this->adminA->assignRole('admin-school');

    // ─── Tenant B ──────────────────────────────
    $this->tenantB = Tenant::create([
        'name'              => 'École Beta',
        'slug'              => 'ecole-beta',
        'is_active'         => true,
        'subscription_plan' => 'free',
        'primary_color'     => '#DC2626',
        'settings'          => ['features' => ['finance' => false]],
    ]);

    $this->adminB = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantB->id,
        'first_name' => 'Admin',
        'last_name'  => 'Beta',
        'email'      => 'admin@beta.com',
        'password'   => Hash::make('secret123'),
        'is_active'  => true,
    ]);
    $this->adminB->assignRole('admin-school');
});

// ─── TENANT CREATION ──────────────────────────────────

test('tenant is created with correct attributes', function () {
    expect($this->tenantA->name)->toBe('École Alpha');
    expect($this->tenantA->slug)->toBe('ecole-alpha');
    expect($this->tenantA->is_active)->toBeTrue();
    expect($this->tenantA->subscription_plan)->toBe('premium');
});

// ─── BRANDING CONFIG ──────────────────────────────────

test('tenant returns correct branding configuration', function () {
    $branding = $this->tenantA->getBrandingConfig();

    expect($branding['name'])->toBe('École Alpha');
    expect($branding['primaryColor'])->toBe('#1E40AF');
    expect($branding['secondaryColor'])->toBe('#F59E0B');
    expect($branding['currency'])->toBe('XOF');
});

test('tenant B has different branding from tenant A', function () {
    $brandingA = $this->tenantA->getBrandingConfig();
    $brandingB = $this->tenantB->getBrandingConfig();

    expect($brandingA['primaryColor'])->not->toBe($brandingB['primaryColor']);
    expect($brandingA['name'])->not->toBe($brandingB['name']);
});

// ─── FEATURE ACCESS ───────────────────────────────────

test('premium tenant has access to finance feature', function () {
    expect($this->tenantA->hasFeature('finance'))->toBeTrue();
    expect($this->tenantA->hasFeature('grading'))->toBeTrue();
});

test('free tenant does not have access to finance feature', function () {
    expect($this->tenantB->hasFeature('finance'))->toBeFalse();
});

test('free tenant has access to basic features', function () {
    expect($this->tenantB->hasFeature('admission'))->toBeTrue();
    expect($this->tenantB->hasFeature('vitrine'))->toBeTrue();
});

test('mobile_app is disabled via settings override', function () {
    expect($this->tenantA->hasFeature('mobile_app'))->toBeFalse();
});

test('ultimate plan has access to all features', function () {
    $ultimateTenant = Tenant::create([
        'name'              => 'École Ultimate',
        'slug'              => 'ecole-ultimate',
        'subscription_plan' => 'ultimate',
        'is_active'         => true,
    ]);

    expect($ultimateTenant->hasFeature('finance'))->toBeTrue();
    expect($ultimateTenant->hasFeature('grading'))->toBeTrue();
    expect($ultimateTenant->hasFeature('attendance'))->toBeTrue();
    expect($ultimateTenant->hasFeature('mobile_app'))->toBeTrue();
    expect($ultimateTenant->hasFeature('reports'))->toBeTrue();
    expect($ultimateTenant->hasFeature('audit'))->toBeTrue();
});

// ─── USER-TENANT BINDING ─────────────────────────────

test('user belongs to correct tenant', function () {
    expect($this->adminA->tenant_id)->toBe($this->tenantA->id);
    expect($this->adminB->tenant_id)->toBe($this->tenantB->id);
});

test('admin A cannot login as admin B', function () {
    app()->instance('current_tenant_id', $this->tenantA->id);

    $response = $this->postJson('/api/v1/auth/login', [
        'email'    => 'admin@beta.com',   // Tenant B user
        'password' => 'secret123',
    ]);

    // Should fail because admin B is not in tenant A's scope
    $response->assertStatus(422);
});

// ─── CROSS-TENANT DATA ISOLATION ──────────────────────

test('tenant A admin can only see tenant A data via login context', function () {
    // Set context to Tenant A
    app()->instance('current_tenant_id', $this->tenantA->id);

    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'email'    => 'admin@alpha.com',
        'password' => 'secret123',
    ]);

    $loginResponse->assertOk();

    // Verify the returned user belongs to tenant A
    expect($loginResponse->json('data.user.email'))->toBe('admin@alpha.com');
});

// ─── GOOGLE BUSINESS ──────────────────────────────────

test('tenant without Google Business returns not configured', function () {
    expect($this->tenantA->isGoogleBusinessConfigured())->toBeFalse();
});

test('tenant with Google Place ID is considered configured', function () {
    $this->tenantA->update(['google_place_id' => 'ChIJN1t_tDeuEmsRUsoyG83frY4']);

    expect($this->tenantA->fresh()->isGoogleBusinessConfigured())->toBeTrue();
});
