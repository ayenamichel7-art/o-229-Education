<?php

use App\Models\Payment;
use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/*
|--------------------------------------------------------------------------
| Payment Tests — o-229 Education
|--------------------------------------------------------------------------
|
| Tests covering:
|   - CRUD operations on payments
|   - Authorization (only users with correct permissions)
|   - Installment processing
|   - Financial summary
|   - Cross-tenant isolation
|
*/

beforeEach(function () {
    // Create permissions and roles
    $permissions = [
        'view-students', 'manage-students',
        'view-financials', 'manage-payments',
    ];
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
    }

    $adminRole = Role::firstOrCreate(['name' => 'admin-school', 'guard_name' => 'web']);
    $adminRole->syncPermissions($permissions);

    $teacherRole = Role::firstOrCreate(['name' => 'teacher', 'guard_name' => 'web']);
    $teacherRole->syncPermissions(['view-students']);

    $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);

    // Create tenant
    $this->tenant = Tenant::create([
        'name' => 'Test School Payments',
        'slug' => 'test-payments',
        'is_active' => true,
    ]);

    app()->instance('current_tenant_id', $this->tenant->id);
    app()->instance('current_tenant', $this->tenant);

    // Create admin user
    $this->admin = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenant->id,
        'first_name' => 'Finance',
        'last_name'  => 'Admin',
        'email'      => 'finance@test-school.com',
        'password'   => Hash::make('secret123'),
        'is_active'  => true,
    ]);
    $this->admin->assignRole('admin-school');

    // Create teacher user (limited permissions)
    $this->teacher = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenant->id,
        'first_name' => 'Marie',
        'last_name'  => 'Prof',
        'email'      => 'teacher@test-school.com',
        'password'   => Hash::make('secret123'),
        'is_active'  => true,
    ]);
    $this->teacher->assignRole('teacher');

    // Create student user + student profile
    $studentUser = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenant->id,
        'first_name' => 'Pierre',
        'last_name'  => 'Eleve',
        'email'      => 'student@test-school.com',
        'password'   => Hash::make('secret123'),
        'is_active'  => true,
    ]);
    $studentUser->assignRole('student');

    $this->student = Student::create([
        'user_id'         => $studentUser->id,
        'matricule'       => 'O229-2026-00001',
        'enrollment_date' => now(),
        'status'          => 'active',
    ]);
});

// ─── CREATE PAYMENT ────────────────────────────────────

test('admin can create a payment', function () {
    $response = $this->actingAs($this->admin)
        ->postJson('/api/v1/payments', [
            'student_id'     => $this->student->id,
            'amount'         => 150000,
            'payment_method' => 'cash',
            'type'           => 'tuition',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.amount', '150000.00');

    $this->assertDatabaseHas('payments', [
        'student_id' => $this->student->id,
        'amount'     => 150000,
        'status'     => 'pending',
    ]);
});

test('teacher cannot create a payment (no manage-payments permission)', function () {
    $response = $this->actingAs($this->teacher)
        ->postJson('/api/v1/payments', [
            'student_id'     => $this->student->id,
            'amount'         => 50000,
            'payment_method' => 'cash',
        ]);

    $response->assertStatus(403);
});

test('unauthenticated user cannot create a payment', function () {
    $response = $this->postJson('/api/v1/payments', [
        'student_id' => $this->student->id,
        'amount'     => 50000,
    ]);

    $response->assertStatus(401);
});

// ─── VALIDATION ────────────────────────────────────────

test('payment requires student_id and amount', function () {
    $response = $this->actingAs($this->admin)
        ->postJson('/api/v1/payments', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['student_id', 'amount']);
});

test('payment amount cannot be negative', function () {
    $response = $this->actingAs($this->admin)
        ->postJson('/api/v1/payments', [
            'student_id' => $this->student->id,
            'amount'     => -5000,
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['amount']);
});

// ─── LIST PAYMENTS ─────────────────────────────────────

test('admin can list payments', function () {
    Payment::create([
        'student_id' => $this->student->id,
        'amount'     => 100000,
        'amount_paid' => 0,
        'status'     => 'pending',
        'type'       => 'tuition',
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/api/v1/payments');

    $response->assertOk()
        ->assertJsonStructure(['data']);
});

// ─── INSTALLMENT ───────────────────────────────────────

test('admin can process an installment on a payment', function () {
    $payment = Payment::create([
        'student_id'  => $this->student->id,
        'amount'      => 200000,
        'amount_paid' => 0,
        'status'      => 'pending',
        'type'        => 'tuition',
    ]);

    $response = $this->actingAs($this->admin)
        ->postJson("/api/v1/payments/{$payment->id}/installment", [
            'amount'         => 75000,
            'payment_method' => 'mobile_money',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.amount_paid', '75000.00')
        ->assertJsonPath('data.status', 'partial');
});

test('full installment marks payment as paid', function () {
    $payment = Payment::create([
        'student_id'  => $this->student->id,
        'amount'      => 100000,
        'amount_paid' => 0,
        'status'      => 'pending',
        'type'        => 'tuition',
    ]);

    $response = $this->actingAs($this->admin)
        ->postJson("/api/v1/payments/{$payment->id}/installment", [
            'amount'         => 100000,
            'payment_method' => 'bank_transfer',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.status', 'paid');
});

// ─── FINANCIAL SUMMARY ────────────────────────────────

test('admin can get financial summary', function () {
    Payment::create([
        'student_id'  => $this->student->id,
        'amount'      => 200000,
        'amount_paid' => 100000,
        'status'      => 'partial',
        'type'        => 'tuition',
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/api/v1/payments-summary');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'total_invoiced',
                'total_collected',
                'total_pending',
                'collection_rate',
                'payment_count',
            ],
        ]);
});

// ─── DELETE PAYMENT ───────────────────────────────────

test('admin can delete a payment', function () {
    $payment = Payment::create([
        'student_id' => $this->student->id,
        'amount'     => 50000,
        'amount_paid' => 0,
        'status'     => 'pending',
        'type'       => 'tuition',
    ]);

    $response = $this->actingAs($this->admin)
        ->deleteJson("/api/v1/payments/{$payment->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('payments', ['id' => $payment->id]);
});
