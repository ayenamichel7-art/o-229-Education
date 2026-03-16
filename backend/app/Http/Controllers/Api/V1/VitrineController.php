<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
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
        $page = LandingPage::where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (!$page) {
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
                'content' => $page->content,
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
        $this->authorize('create', LandingPage::class);

        $request->validate([
            'slug'             => ['required', 'string', 'max:100', 'regex:/^[a-z0-9\-]+$/'],
            'title'            => ['required', 'string', 'max:255'],
            'content'          => ['required', 'array'],
            'is_published'     => ['nullable', 'boolean'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'settings'         => ['nullable', 'array'],
        ]);

        $page = LandingPage::updateOrCreate(
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
