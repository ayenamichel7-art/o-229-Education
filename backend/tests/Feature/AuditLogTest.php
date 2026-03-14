<?php

use App\Models\Tenant;
use App\Models\User;
use App\Models\ActivityLog;

beforeEach(function () {
    $this->tenant = Tenant::create([
        'name' => 'Audit School',
        'slug' => 'audit-school',
        'domain' => 'audit.o-229.com',
        'is_active' => true,
    ]);

    app()->instance('current_tenant_id', $this->tenant->id);

    $this->user = User::withoutGlobalScopes()->create([
        'tenant_id' => $this->tenant->id,
        'first_name' => 'Inspector',
        'last_name' => 'Gadget',
        'email' => 'audit@audit-school.com',
        'password' => bcrypt('secret123'),
    ]);
});

test('audit logs index returns paginated logs', function () {
    ActivityLog::create([
        'tenant_id' => $this->tenant->id,
        'user_id' => $this->user->id,
        'action' => 'login',
        'entity_type' => 'Auth',
        'entity_id' => 0,
        'performed_at' => now(),
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/v1/audit-logs');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'user_id', 'action', 'entity_type', 'performed_at']
            ],
            'meta' => ['current_page', 'last_page']
        ])
        ->assertJsonPath('data.0.action', 'login');
});

test('audit logs can be filtered by action', function () {
    ActivityLog::create(['tenant_id' => $this->tenant->id, 'action' => 'created', 'entity_type' => 'Student', 'entity_id' => 1, 'performed_at' => now()]);
    ActivityLog::create(['tenant_id' => $this->tenant->id, 'action' => 'deleted', 'entity_type' => 'Payment', 'entity_id' => 2, 'performed_at' => now()]);

    $response = $this->actingAs($this->user)->getJson('/api/v1/audit-logs?action=deleted');

    $response->assertOk();
    $data = $response->json('data');
    
    expect(count($data))->toBe(1);
    expect($data[0]['action'])->toBe('deleted');
});

test('audit logs stats return accurate counts', function () {
    ActivityLog::create(['tenant_id' => $this->tenant->id, 'action' => 'created', 'entity_type' => 'Student', 'entity_id' => 1, 'performed_at' => now()]);
    ActivityLog::create(['tenant_id' => $this->tenant->id, 'action' => 'created', 'entity_type' => 'Student', 'entity_id' => 2, 'performed_at' => now()]);
    ActivityLog::create(['tenant_id' => $this->tenant->id, 'action' => 'updated', 'entity_type' => 'Payment', 'entity_id' => 2, 'performed_at' => now()]);

    $response = $this->actingAs($this->user)->getJson('/api/v1/audit-logs/stats');

    $response->assertOk()
        ->assertJsonPath('data.total_logs', 3)
        ->assertJsonPath('data.by_action.created', 2)
        ->assertJsonPath('data.by_action.updated', 1);
});
