<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MobileAppController extends Controller
{
    /**
     * Get the mobile app configuration for the tenant.
     */
    public function index()
    {
        $app = \App\Models\MobileApp::first();
        
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
        $request->validate([
            'app_name' => 'required|string',
            'package_name' => 'required|string',
            'config' => 'required|array',
        ]);

        $app = \App\Models\MobileApp::updateOrCreate(
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
        $app = \App\Models\MobileApp::first();
        if (!$app) return response()->json(['message' => 'App not configured'], 400);

        $app->update(['status' => 'building']);

        // Mock background job
        // In reality, this would trigger a GitHub Action or a Fastlane server
        dispatch(function () use ($app) {
            sleep(10); // Simulating build time
            $app->update([
                'status' => 'active',
                'apk_url' => 'https://storage.o-229.com/builds/' . $app->package_name . '.apk',
                'last_build_at' => now()
            ]);
        })->afterResponse();

        return response()->json(['message' => 'Build started', 'data' => $app]);
    }
}
