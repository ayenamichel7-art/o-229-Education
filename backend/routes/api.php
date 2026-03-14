<?php

use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ConfigController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\FormTemplateController;
use App\Http\Controllers\Api\V1\MobileAppController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\StudentController;
use App\Http\Controllers\Api\V1\VitrineController;
// use App\Http\Middleware\IdentifyTenant; // Suppressed for stancl/tenancy
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

    // Branding config (public)
    Route::get('/config', ConfigController::class)->name('config');

    // Vitrine (Public but tenant-aware)
    Route::middleware(['tenancy'])->group(function () {
        Route::get('/vitrine', [VitrineController::class, 'index'])->name('vitrine.index');
        Route::get('/vitrine/{slug}', [VitrineController::class, 'show'])->name('vitrine.show');

        // Registration Forms
        Route::get('/registration-forms', [FormTemplateController::class, 'index'])->name('forms.index');
        Route::get('/registration-forms/{id}', [FormTemplateController::class, 'show'])->name('forms.show');
        Route::post('/registration-forms/{id}/submit', [FormTemplateController::class, 'submit'])->name('forms.submit');
    });

    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:5,1') // Max 5 attempts per minute per IP
            ->name('auth.login');
    });
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

        // ─── Activity Logs (Audit Trail) ─────────────────
        Route::prefix('audit-logs')->group(function () {
            Route::get('/', [AuditLogController::class, 'index'])->name('audit-logs.index');
            Route::get('/stats', [AuditLogController::class, 'stats'])->name('audit-logs.stats');
            Route::get('/{id}', [AuditLogController::class, 'show'])->name('audit-logs.show');
        });
    });


