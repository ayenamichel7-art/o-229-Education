<?php

use App\Http\Controllers\Api\V1\AcademicReportController;
use App\Http\Controllers\Api\V1\AlumniController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ConfigController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\ExamController;
use App\Http\Controllers\Api\V1\FormTemplateController;
use App\Http\Controllers\Api\V1\HealthCheckController;
use App\Http\Controllers\Api\V1\JobOfferController;
use App\Http\Controllers\Api\V1\LessonLogController;
use App\Http\Controllers\Api\V1\MobileAppController;
use App\Http\Controllers\Api\V1\ParentCRMController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PaymentGatewayController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\SchoolClassController;
use App\Http\Controllers\Api\V1\StaffAttendanceController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\SubjectController;
use App\Http\Controllers\Api\V1\TeacherController;
use App\Http\Controllers\Api\V1\TenantSettingsController;
use App\Http\Controllers\Api\V1\TimetableController;
use App\Http\Controllers\Api\V1\VitrineController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| o-229 Education API Routes — v1
|--------------------------------------------------------------------------
|
| Public routes (no auth required):
|   - /api/v1/config         → Tenant branding
|   - /api/v1/auth/login     → Login
|   - /api/v1/vitrine        → Landing pages
|   - /api/v1/payments/webhook → Payment gateway webhooks
|
| Protected routes (auth + tenant):
|   - All CRUD endpoints
|   - Dashboard KPIs
|   - Reports
|   - Vitrine Management
|
*/

// ─── Public Routes ───────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Health check (public for monitoring tools)
    Route::get('/health', HealthCheckController::class)->name('health');

    // Branding config (public)
    Route::get('/config', ConfigController::class)->name('config');

    // Vitrine (Public but tenant-aware)
    Route::middleware(['tenancy'])->group(function () {
        Route::get('/vitrine', [VitrineController::class, 'index'])->name('vitrine.index');
        Route::get('/vitrine/{slug}', [VitrineController::class, 'show'])->name('vitrine.show');

        // Registration Forms (public, with rate limiting + anti-spam)
        Route::get('/registration-forms', [FormTemplateController::class, 'index'])->name('forms.index');
        Route::get('/registration-forms/{id}', [FormTemplateController::class, 'show'])->name('forms.show');
        Route::post('/registration-forms/{id}/submit', [FormTemplateController::class, 'submit'])
            ->middleware('throttle:10,1') // Max 10 submissions per minute per IP
            ->name('forms.submit');
    });

    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1') // Max 5 attempts per minute per IP
            ->name('auth.login');
    });

    // ─── Payment Webhooks (Public — verified by HMAC signature) ──
    // These MUST be outside auth:sanctum since they are called by external payment gateways
    Route::post('/payments/webhook', [PaymentGatewayController::class, 'webhook'])
        ->middleware('throttle:60,1') // Max 60 webhook calls per minute per IP
        ->name('payments.webhook');
});

// ─── Protected Routes (Auth + Tenant Scope) ──────────────
Route::prefix('v1')
    ->middleware(['auth:sanctum', 'tenancy'])
    ->group(function () {

        // Vitrine Management
        Route::post('/vitrine', [VitrineController::class, 'store'])->name('vitrine.store');

        // Mobile App Management
        Route::middleware('feature:mobile_app')->group(function () {
            Route::get('/mobile-app', [MobileAppController::class, 'index'])->name('mobile-app.index');
            Route::post('/mobile-app', [MobileAppController::class, 'store'])->name('mobile-app.store');
            Route::post('/mobile-app/build', [MobileAppController::class, 'requestBuild'])->name('mobile-app.build');
        });

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/auth/me', [AuthController::class, 'me'])->name('auth.me');

        // ─── Dashboard & KPIs ────────────────────────────
        Route::prefix('dashboard')->group(function () {
            Route::get('/kpis', [DashboardController::class, 'kpis'])->name('dashboard.kpis');
            Route::get('/enrollment', [DashboardController::class, 'enrollment'])->name('dashboard.enrollment');
            Route::get('/financial', [DashboardController::class, 'financial'])->name('dashboard.financial');
        });

        // ─── Students ────────────────────────────────────
        Route::apiResource('students', StudentController::class);

        // ─── Payments ────────────────────────────────────
        Route::apiResource('payments', PaymentController::class);
        Route::post('/payments/{payment}/installment', [PaymentController::class, 'installment'])
            ->name('payments.installment');
        Route::get('/payments-summary', [PaymentController::class, 'summary'])
            ->name('payments.summary');

        // ─── Reports ─────────────────────────────────────
        Route::prefix('reports')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('reports.index');
            Route::post('/generate', [ReportController::class, 'generate'])->name('reports.generate');
            Route::get('/types', [ReportController::class, 'types'])->name('reports.types');
        });

        // ─── Resources ───────────────────────────────────
        Route::apiResources([
            'audit-logs' => AuditLogController::class,
            'timetable' => TimetableController::class,
            'attendance' => AttendanceController::class,
            'staff-attendance' => StaffAttendanceController::class,
            'lesson-logs' => LessonLogController::class,
            'classes' => SchoolClassController::class,
            'subjects' => SubjectController::class,
            'teachers' => TeacherController::class,
        ]);

        // Exams & Reports
        Route::apiResource('exams', ExamController::class);
        Route::post('exams/{exam}/results', [ExamController::class, 'enterResults'])->name('exams.results');
        Route::post('exams/{exam}/publish', [ExamController::class, 'publish'])->name('exams.publish');

        Route::get('students/{student}/report-card', [AcademicReportController::class, 'generateStudentReport'])->name('students.report-card');
        Route::get('classes/{class}/report-cards', [AcademicReportController::class, 'generateClassReports'])->name('classes.report-cards');

        // Communication (rate limited to prevent SMS spam)
        Route::apiResource('communications', CommunicationController::class)->only(['index', 'store', 'show', 'destroy']);
        Route::post('communications', [CommunicationController::class, 'store'])
            ->middleware('throttle:10,1') // Max 10 communications per minute
            ->name('communications.store');

        // Discipline
        Route::apiResource('discipline', DisciplineController::class)->only(['index', 'store']);

        // Transport & Canteen
        Route::get('transport', [TransportController::class, 'index']);
        Route::post('transport', [TransportController::class, 'store']);
        Route::get('transport/subscriptions', [TransportController::class, 'subscriptions']);
        Route::post('transport/subscribe', [TransportController::class, 'subscribe']);

        Route::get('canteen', [CanteenController::class, 'index']);
        Route::post('canteen', [CanteenController::class, 'store']);
        Route::get('canteen/subscriptions', [CanteenController::class, 'subscriptions']);
        Route::post('canteen/subscribe', [CanteenController::class, 'subscribe']);

        // Inventory
        Route::apiResource('inventory', InventoryController::class)->only(['index', 'store', 'show', 'update']);
        Route::post('inventory/{item}/stock', [InventoryController::class, 'updateStock']);
        Route::get('inventory/{item}/transactions', [InventoryController::class, 'transactions']);

        Route::get('/tenant/brochure', [AcademicReportController::class, 'generateBrochure'])
            ->name('tenant.brochure');

        // ─── Alumni & Professional Integration ───────────
        Route::get('alumni', [AlumniController::class, 'index']);
        Route::post('alumni', [AlumniController::class, 'store']);
        Route::get('job-offers', [JobOfferController::class, 'index']);
        Route::post('job-offers', [JobOfferController::class, 'store']);

        // ─── Parent CRM ─────────────────────────────────────
        Route::get('crm-parents', [ParentCRMController::class, 'index']);
        Route::get('crm-parents/{student}/interactions', [ParentCRMController::class, 'showInteractions']);
        Route::post('crm-parents/{student}/interactions', [ParentCRMController::class, 'storeInteraction']);

        // ─── Local Payments (initiation only — webhook is public) ─
        Route::post('/payments/initiate', [PaymentGatewayController::class, 'initiate'])
            ->middleware('throttle:20,1') // Rate limit payment initiation
            ->name('payments.initiate');

        // ─── Tenant Settings ────────────────────────────
        Route::post('/tenant/report-settings', [TenantSettingsController::class, 'updateReportSettings'])
            ->name('tenant.report-settings.update');

        Route::post('/tenant/branding', [TenantSettingsController::class, 'updateBranding'])
            ->name('tenant.branding.update');

        Route::post('/tenant/upload-logo', [TenantSettingsController::class, 'uploadLogo'])
            ->name('tenant.upload-logo');

        Route::post('/tenant/upload-seal', [TenantSettingsController::class, 'uploadSeal'])
            ->name('tenant.upload-seal');

        Route::post('/staff/check-in-out', [StaffAttendanceController::class, 'checkInOut'])
            ->name('staff.check-in-out');

        Route::post('/tenant/location', [TenantSettingsController::class, 'updateLocation'])
            ->name('tenant.location.update');
        Route::get('/proxy/google-places', [TenantSettingsController::class, 'googlePlacesProxy'])
            ->name('proxy.google-places');
    });
