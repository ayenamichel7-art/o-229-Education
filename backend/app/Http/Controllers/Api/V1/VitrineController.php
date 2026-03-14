<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class VitrineController extends Controller
{
    /**
     * Get the main landing page for the tenant.
     */
    public function index()
    {
        return $this->show('home');
    }

    /**
     * Get a specific page by slug.
     */
    public function show($slug)
    {
        $page = \App\Models\LandingPage::where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (!$page) {
            // If home doesn't exist, return default branding from Tenant
            if ($slug === 'home') {
                return response()->json([
                    'data' => [
                        'is_default' => true,
                        'branding' => resolve('current_tenant')->getBrandingConfig(),
                        'blocks' => []
                    ]
                ]);
            }
            return response()->json(['message' => 'Page not found'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'content' => $page->content, // This contains the blocks (A to Z)
                'settings' => $page->settings,
                'branding' => resolve('current_tenant')->getBrandingConfig(),
            ]
        ]);
    }

    /**
     * Update or Create landing page content (Page Builder Save).
     */
    public function store(Request $request)
    {
        $request->validate([
            'slug' => 'required|string',
            'title' => 'required|string',
            'content' => 'required|array',
        ]);

        $page = \App\Models\LandingPage::updateOrCreate(
            ['slug' => $request->slug],
            [
                'title' => $request->title,
                'content' => $request->input('content'),
                'is_published' => $request->get('is_published', true),
                'meta_description' => $request->get('meta_description'),
                'settings' => $request->get('settings'),
            ]
        );

        return response()->json(['message' => 'Page saved successfully', 'data' => $page]);
    }
}
