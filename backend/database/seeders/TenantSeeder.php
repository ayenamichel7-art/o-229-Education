<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class TenantSeeder extends Seeder
{
    /**
     * Seed the tenant database/schema.
     * This runs WITHIN the tenant context.
     */
    public function run(): void
    {
        // ─── Permissions ─────────────────────────────────
        $permissions = [
            'view-students', 'manage-students',
            'view-teachers', 'manage-teachers',
            'view-grades', 'edit-grades',
            'view-financials', 'manage-payments',
            'view-attendance', 'manage-attendance',
            'manage-users', 'manage-school',
            'view-reports', 'generate-reports',
            'manage-forms', 'view-activity-logs',
            'manage-vitrine',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // ─── Roles ───────────────────────────────────────
        $adminSchool = Role::firstOrCreate(['name' => 'admin-school', 'guard_name' => 'web']);
        $adminSchool->syncPermissions($permissions);

        $teacherRole = Role::firstOrCreate(['name' => 'teacher', 'guard_name' => 'web']);
        $teacherRole->syncPermissions([
            'view-students', 'view-grades', 'edit-grades',
            'view-attendance', 'manage-attendance',
        ]);

        $parent = Role::firstOrCreate(['name' => 'parent', 'guard_name' => 'web']);
        $parent->syncPermissions([
            'view-students', 'view-grades', 'view-financials', 'view-attendance',
        ]);

        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
        $studentRole->syncPermissions([
            'view-grades', 'view-attendance',
        ]);

        // ─── Default Admin User ──────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'tech@o-229.com'], // Root support email
            [
                'first_name' => 'Admin',
                'last_name' => 'O-229',
                'password' => Hash::make('password'),
                'is_active' => true,
            ]
        );
        $admin->assignRole('admin-school');

        // ─── Academic Year ───────────────────────────────
        $year = AcademicYear::firstOrCreate(
            ['name' => '2025-2026'],
            [
                'starts_at' => '2025-09-01',
                'ends_at' => '2026-07-15',
                'is_current' => true,
            ]
        );

        // ─── Demo Data ───────────────────────────────────
        $subjects = ['Mathématiques', 'Français', 'Anglais', 'Physique-Chimie'];
        foreach ($subjects as $i => $name) {
            Subject::firstOrCreate(['name' => $name], [
                'code' => strtoupper(substr($name, 0, 3)),
                'coefficient' => 2.0,
            ]);
        }

        $class = SchoolClass::firstOrCreate(['name' => '6ème A'], [
            'level' => 'secondary',
            'section' => 'A',
            'capacity' => 40,
            'academic_year_id' => $year->id,
        ]);

        // Create a few demo students
        for ($i = 1; $i <= 5; $i++) {
            $studentUser = User::create([
                'first_name' => 'Élève ' . $i,
                'last_name' => 'Horizon',
                'email' => "eleve{$i}@horizon.o-229.com",
                'password' => Hash::make('password'),
                'is_active' => true,
            ]);
            $studentUser->assignRole('student');

            Student::create([
                'user_id' => $studentUser->id,
                'matricule' => 'STU-HZR-' . str_pad((string)$i, 3, '0', STR_PAD_LEFT),
                'class_id' => $class->id,
                'academic_year_id' => $year->id,
                'status' => 'active',
            ]);
        }
    }
}
