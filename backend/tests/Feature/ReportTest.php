<?php

use App\Models\Tenant;
use App\Models\User;
use App\Models\ActivityLog;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Queue;
use App\Jobs\ExportReportJob;

beforeEach(function () {
    $permissions = ['view-financials', 'manage-reports'];
    foreach ($permissions as $perm) {
        Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
    }
    $role = Role::firstOrCreate(['name' => 'admin-school', 'guard_name' => 'web']);
    $role->syncPermissions($permissions);

    $this->tenant = Tenant::create([
        'name' => 'Test School',
        'slug' => 'test-school',
        'domain' => 'test-school.o-229.com',
        'is_active' => true,
    ]);

    app()->instance('current_tenant_id', $this->tenant->id);

    $this->user = User::withoutGlobalScopes()->create([
        'tenant_id' => $this->tenant->id,
        'first_name' => 'Reporter',
        'last_name' => 'Admin',
        'email' => 'report@test-school.com',
        'password' => bcrypt('secret123'),
    ]);
    $this->user->assignRole('admin-school');
});

test('reports index returns paginated history of reports', function () {
    // Simulate some report logs in DB
    ActivityLog::create([
        'tenant_id' => $this->tenant->id,
        'user_id' => $this->user->id,
        'action' => 'created',
        'entity_type' => 'Report',
        'entity_id' => 0,
        'new_values' => ['title' => 'Bilan 1', 'type' => 'financial', 'status' => 'completed'],
        'performed_at' => now(),
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/v1/reports');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'type', 'generated_by', 'status']
            ],
            'meta' => ['current_page', 'pending_jobs']
        ]);
});

test('generating a report dispatches the ExportReportJob', function () {
    Queue::fake();

    $response = $this->actingAs($this->user)->postJson('/api/v1/reports/generate', [
        'type' => 'financial',
        'title' => 'Rapport Mensuel Février 2026',
    ]);

    $response->assertStatus(202)
        ->assertJson(['message' => 'Rapport en cours de génération. Vous serez notifié.']);

    Queue::assertPushed(ExportReportJob::class, function ($job) {
        return $job->tenantId === $this->tenant->id 
            && $job->reportType === 'financial'
            && $job->userId === $this->user->id;
    });
});

test('generating an invalid report type fails validation', function () {
    $response = $this->actingAs($this->user)->postJson('/api/v1/reports/generate', [
        'type' => 'unknown_type',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('type');
});

test('report types endpoint returns available formats', function () {
    $response = $this->actingAs($this->user)->getJson('/api/v1/reports/types');

    $response->assertOk();
    
    // Check if expected types are in the response
    $types = collect($response->json('data'))->pluck('type')->toArray();
    expect($types)->toContain('financial', 'academic', 'attendance', 'analytical');
});
