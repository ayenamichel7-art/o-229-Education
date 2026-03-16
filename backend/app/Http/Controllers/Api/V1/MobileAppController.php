<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MobileApp;
use Illuminate\Http\Request;

class MobileAppController extends Controller
{
    public function __construct()
    {
        $this->authorize('viewAny', MobileApp::class);
    }

    /**
     * Get the mobile app configuration for the tenant.
     */
    public function index()
    {
        $app = MobileApp::first();
        
        if (!$app) {
            $tenant = resolve('current_tenant');
            return response()->json([
                'data' => [
                    'app_name' => $tenant->name,
                    'package_name' => 'com.o229.' . \Illuminate\Support\Str::slug($tenant->name),
                    'status' => 'not_created',
                    'config' => [
                        'primary_color' => $tenant->primary_color,
                        'secondary_color' => $tenant->secondary_color,
                    ]
                ]
            ]);
        }

        return response()->json(['data' => $app]);
    }

    /**
     * Update or Create mobile app configuration.
     */
    public function store(Request $request)
    {
        $this->authorize('create', MobileApp::class);

        $request->validate([
            'app_name'     => ['required', 'string', 'max:100'],
            'package_name' => ['required', 'string', 'max:150', 'regex:/^[a-z][a-z0-9_.]*$/'],
            'config'       => ['required', 'array'],
        ]);

        $app = MobileApp::updateOrCreate(
            ['tenant_id' => resolve('current_tenant_id')],
            [
                'app_name' => $request->app_name,
                'package_name' => $request->package_name,
                'config' => $request->config,
                'status' => 'pending'
            ]
        );

        return response()->json(['message' => 'Configuration saved', 'data' => $app]);
    }

    /**
     * Request a new APK/IPA build.
     */
    public function requestBuild()
    {
        $this->authorize('build', MobileApp::class);

        $app = MobileApp::first();
        if (!$app) return response()->json(['message' => 'App not configured'], 400);

        $app->update(['status' => 'building']);

        dispatch(function () use ($app) {
            sleep(10);
            $app->update([
                'status' => 'active',
                'apk_url' => 'https://storage.o-229.com/builds/' . $app->package_name . '.apk',
                'last_build_at' => now()
            ]);
        })->afterResponse();

        return response()->json(['message' => 'Build started', 'data' => $app]);
    }
}
