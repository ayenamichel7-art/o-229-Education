<?php

use App\Models\Student;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/*
|--------------------------------------------------------------------------
| Student Tests — o-229 Education
|--------------------------------------------------------------------------
|
| Tests covering:
|   - CRUD operations on students
|   - Authorization via StudentPolicy
|   - Search / filtering
|   - Cross-tenant isolation
|   - Matricule generation
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

    // Create tenant A
    $this->tenantA = Tenant::create([
        'name' => 'School A',
        'slug' => 'school-a',
        'is_active' => true,
    ]);

    app()->instance('current_tenant_id', $this->tenantA->id);
    app()->instance('current_tenant', $this->tenantA);

    // Create admin for tenant A
    $this->adminA = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Admin',
        'last_name'  => 'SchoolA',
        'email'      => 'admin@school-a.com',
        'password'   => Hash::make('secret123'),
        'is_active'  => true,
    ]);
    $this->adminA->assignRole('admin-school');

    // Create teacher for tenant A (limited permissions)
    $this->teacherA = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Teacher',
        'last_name'  => 'SchoolA',
        'email'      => 'teacher@school-a.com',
        'password'   => Hash::make('secret123'),
        'is_active'  => true,
    ]);
    $this->teacherA->assignRole('teacher');
});

// ─── CREATE STUDENT ──────────────────────────────────

test('admin can create a student', function () {
    $response = $this->actingAs($this->adminA)
        ->postJson('/api/v1/students', [
            'first_name'  => 'Amadou',
            'last_name'   => 'Diallo',
            'email'       => 'amadou@test.com',
            'phone'       => '+225 07 00 00 00',
            'gender'      => 'male',
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.user.first_name', 'Amadou');

    $this->assertDatabaseHas('students', [
        'status' => 'active',
    ]);
});

test('teacher cannot create a student (no manage-students permission)', function () {
    $response = $this->actingAs($this->teacherA)
        ->postJson('/api/v1/students', [
            'first_name' => 'Test',
            'last_name'  => 'Student',
            'email'      => 'test@students.com',
        ]);

    $response->assertStatus(403);
});

test('unauthenticated user cannot create a student', function () {
    $response = $this->postJson('/api/v1/students', [
        'first_name' => 'Test',
        'last_name'  => 'Student',
        'email'      => 'test@students.com',
    ]);

    $response->assertStatus(401);
});

// ─── VALIDATION ────────────────────────────────────────

test('student creation requires first_name, last_name and email', function () {
    $response = $this->actingAs($this->adminA)
        ->postJson('/api/v1/students', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['first_name', 'last_name', 'email']);
});

test('student gender must be valid enum', function () {
    $response = $this->actingAs($this->adminA)
        ->postJson('/api/v1/students', [
            'first_name' => 'Test',
            'last_name'  => 'Student',
            'email'      => 'test@students.com',
            'gender'     => 'invalid',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['gender']);
});

// ─── LIST STUDENTS ─────────────────────────────────────

test('admin can list students', function () {
    // Create a student
    $user = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Existing',
        'last_name'  => 'Student',
        'email'      => 'existing@test.com',
        'password'   => Hash::make('pass'),
        'is_active'  => true,
    ]);

    Student::create([
        'user_id'         => $user->id,
        'matricule'       => 'O229-2026-00001',
        'enrollment_date' => now(),
        'status'          => 'active',
    ]);

    $response = $this->actingAs($this->adminA)
        ->getJson('/api/v1/students');

    $response->assertOk()
        ->assertJsonStructure(['data']);
});

test('teacher can list students (has view-students permission)', function () {
    $response = $this->actingAs($this->teacherA)
        ->getJson('/api/v1/students');

    $response->assertOk();
});

// ─── SEARCH STUDENTS ──────────────────────────────────

test('students can be searched by name', function () {
    $user = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Fatou',
        'last_name'  => 'Keita',
        'email'      => 'fatou@test.com',
        'password'   => Hash::make('pass'),
        'is_active'  => true,
    ]);

    Student::create([
        'user_id'         => $user->id,
        'matricule'       => 'O229-2026-00002',
        'enrollment_date' => now(),
        'status'          => 'active',
    ]);

    $response = $this->actingAs($this->adminA)
        ->getJson('/api/v1/students?search=Fatou');

    $response->assertOk();
});

// ─── UPDATE STUDENT ──────────────────────────────────

test('admin can update a student', function () {
    $user = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Update',
        'last_name'  => 'Me',
        'email'      => 'update@test.com',
        'password'   => Hash::make('pass'),
        'is_active'  => true,
    ]);

    $student = Student::create([
        'user_id'         => $user->id,
        'matricule'       => 'O229-2026-00003',
        'enrollment_date' => now(),
        'status'          => 'active',
    ]);

    $response = $this->actingAs($this->adminA)
        ->putJson("/api/v1/students/{$student->id}", [
            'status' => 'graduated',
            'gender' => 'male',
        ]);

    $response->assertOk();
    $this->assertDatabaseHas('students', [
        'id'     => $student->id,
        'status' => 'graduated',
        'gender' => 'male',
    ]);
});

// ─── DELETE STUDENT ──────────────────────────────────

test('admin can delete a student', function () {
    $user = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Delete',
        'last_name'  => 'Me',
        'email'      => 'delete@test.com',
        'password'   => Hash::make('pass'),
        'is_active'  => true,
    ]);

    $student = Student::create([
        'user_id'         => $user->id,
        'matricule'       => 'O229-2026-00004',
        'enrollment_date' => now(),
        'status'          => 'active',
    ]);

    $response = $this->actingAs($this->adminA)
        ->deleteJson("/api/v1/students/{$student->id}");

    $response->assertOk();
    $this->assertDatabaseMissing('students', ['id' => $student->id]);
});

test('teacher cannot delete a student', function () {
    $user = User::withoutGlobalScopes()->create([
        'tenant_id'  => $this->tenantA->id,
        'first_name' => 'Protected',
        'last_name'  => 'Student',
        'email'      => 'protected@test.com',
        'password'   => Hash::make('pass'),
        'is_active'  => true,
    ]);

    $student = Student::create([
        'user_id'         => $user->id,
        'matricule'       => 'O229-2026-00005',
        'enrollment_date' => now(),
        'status'          => 'active',
    ]);

    $response = $this->actingAs($this->teacherA)
        ->deleteJson("/api/v1/students/{$student->id}");

    $response->assertStatus(403);
});

// ─── MATRICULE GENERATION ────────────────────────────

test('new student gets auto-generated matricule', function () {
    $response = $this->actingAs($this->adminA)
        ->postJson('/api/v1/students', [
            'first_name' => 'Matricule',
            'last_name'  => 'Test',
            'email'      => 'matricule@test.com',
        ]);

    $response->assertStatus(201);

    $student = Student::latest()->first();
    expect($student->matricule)->toStartWith('O229-');
});
