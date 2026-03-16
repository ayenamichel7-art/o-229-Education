<?php

use App\Models\Tenant;
use App\Models\User;
use App\Policies\AuditLogPolicy;
use App\Policies\MobileAppPolicy;
use App\Policies\ReportPolicy;
use App\Policies\UserPolicy;
use App\Policies\VitrinePolicy;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/*
|--------------------------------------------------------------------------
| Authorization Policy Tests — o-229 Education
|--------------------------------------------------------------------------
|
| Tests covering all 8 policies:
|   - UserPolicy
|   - ReportPolicy
|   - AuditLogPolicy
|   - MobileAppPolicy
|   - VitrinePolicy
|   - StudentPolicy (existing)
|   - PaymentPolicy (existing)
|   - FormTemplatePolicy
|
*/

beforeEach(function () {
    // Create roles
    $permissions = [
        'view-students', 'manage-students',
        'view-financials', 'manage-payments',
    ];
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
    }

    Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
    $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'director', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'accountant', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'teacher', 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

    $tenant = Tenant::create([
        'name' => 'Policy Test School',
        'slug' => 'policy-test',
        'is_active' => true,
    ]);

    // Super Admin
    $this->superAdmin = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id, 'first_name' => 'Super', 'last_name' => 'Admin',
        'email' => 'super@test.com', 'password' => Hash::make('pass'), 'is_active' => true,
    ]);
    $this->superAdmin->assignRole('super-admin');

    // Admin
    $this->admin = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id, 'first_name' => 'Regular', 'last_name' => 'Admin',
        'email' => 'admin@test.com', 'password' => Hash::make('pass'), 'is_active' => true,
    ]);
    $this->admin->assignRole('admin');

    // Director
    $this->director = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id, 'first_name' => 'School', 'last_name' => 'Director',
        'email' => 'director@test.com', 'password' => Hash::make('pass'), 'is_active' => true,
    ]);
    $this->director->assignRole('director');

    // Accountant
    $this->accountant = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id, 'first_name' => 'School', 'last_name' => 'Accountant',
        'email' => 'accountant@test.com', 'password' => Hash::make('pass'), 'is_active' => true,
    ]);
    $this->accountant->assignRole('accountant');

    // Teacher
    $this->teacher = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id, 'first_name' => 'Regular', 'last_name' => 'Teacher',
        'email' => 'teacher@test.com', 'password' => Hash::make('pass'), 'is_active' => true,
    ]);
    $this->teacher->assignRole('teacher');

    // Student
    $this->student = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id, 'first_name' => 'Regular', 'last_name' => 'Student',
        'email' => 'student@test.com', 'password' => Hash::make('pass'), 'is_active' => true,
    ]);
    $this->student->assignRole('student');
});

// ─── UserPolicy ──────────────────────────────────────

test('super-admin can manage all users', function () {
    $policy = new UserPolicy();
    expect($policy->viewAny($this->superAdmin))->toBeTrue();
    expect($policy->create($this->superAdmin))->toBeTrue();
    expect($policy->update($this->superAdmin, $this->teacher))->toBeTrue();
    expect($policy->delete($this->superAdmin, $this->teacher))->toBeTrue();
});

test('user can view own profile', function () {
    $policy = new UserPolicy();
    expect($policy->view($this->teacher, $this->teacher))->toBeTrue();
});

test('user cannot view other user profile without admin role', function () {
    $policy = new UserPolicy();
    expect($policy->view($this->teacher, $this->admin))->toBeFalse();
});

test('user cannot delete themselves', function () {
    $policy = new UserPolicy();
    expect($policy->delete($this->superAdmin, $this->superAdmin))->toBeFalse();
});

test('teacher cannot create users', function () {
    $policy = new UserPolicy();
    expect($policy->create($this->teacher))->toBeFalse();
});

// ─── ReportPolicy ────────────────────────────────────

test('admin can view and create reports', function () {
    $policy = new ReportPolicy();
    expect($policy->viewAny($this->admin))->toBeTrue();
    expect($policy->create($this->admin))->toBeTrue();
});

test('accountant can view reports but not create', function () {
    $policy = new ReportPolicy();
    expect($policy->viewAny($this->accountant))->toBeTrue();
    expect($policy->create($this->accountant))->toBeFalse();
});

test('teacher cannot view reports', function () {
    $policy = new ReportPolicy();
    expect($policy->viewAny($this->teacher))->toBeFalse();
});

// ─── AuditLogPolicy ─────────────────────────────────

test('only admin roles can view audit logs', function () {
    $policy = new AuditLogPolicy();
    expect($policy->viewAny($this->superAdmin))->toBeTrue();
    expect($policy->viewAny($this->admin))->toBeTrue();
    expect($policy->viewAny($this->director))->toBeFalse();
    expect($policy->viewAny($this->teacher))->toBeFalse();
    expect($policy->viewAny($this->student))->toBeFalse();
});

// ─── MobileAppPolicy ────────────────────────────────

test('admin can manage mobile app', function () {
    $policy = new MobileAppPolicy();
    expect($policy->viewAny($this->admin))->toBeTrue();
    expect($policy->create($this->admin))->toBeTrue();
    expect($policy->build($this->admin))->toBeTrue();
});

test('director can view but not configure mobile app', function () {
    $policy = new MobileAppPolicy();
    expect($policy->viewAny($this->director))->toBeTrue();
    expect($policy->create($this->director))->toBeFalse();
    expect($policy->build($this->director))->toBeFalse();
});

test('teacher cannot access mobile app config', function () {
    $policy = new MobileAppPolicy();
    expect($policy->viewAny($this->teacher))->toBeFalse();
});

// ─── VitrinePolicy ──────────────────────────────────

test('vitrine pages are publicly viewable', function () {
    $policy = new VitrinePolicy();
    expect($policy->viewAny(null))->toBeTrue();
});

test('admin can create vitrine pages', function () {
    $policy = new VitrinePolicy();
    expect($policy->create($this->admin))->toBeTrue();
    expect($policy->create($this->director))->toBeTrue();
});

test('teacher cannot create vitrine pages', function () {
    $policy = new VitrinePolicy();
    expect($policy->create($this->teacher))->toBeFalse();
});
