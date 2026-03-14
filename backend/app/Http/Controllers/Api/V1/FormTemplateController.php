<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class FormTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = \App\Models\FormTemplate::where('is_active', true)->get();
        return response()->json(['data' => $templates]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $template = \App\Models\FormTemplate::with(['fields' => function($query) {
            $query->orderBy('order');
        }])->findOrFail($id);

        // Group fields by section for cleaner frontend rendering
        $sections = $template->fields->groupBy('section');

        return response()->json([
            'data' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'is_active' => $template->is_active,
                'requires_payment' => $template->requires_payment,
                'registration_fee' => $template->registration_fee,
                'sections' => $sections->map(function ($fields, $section) {
                    return [
                        'title' => $section,
                        'fields' => $fields
                    ];
                })->values()
            ]
        ]);
    }

    /**
     * Submit form data.
     */
    public function submit(Request $request, string $id)
    {
        $template = \App\Models\FormTemplate::findOrFail($id);
        
        // Basic validation could be dynamic here based on $template->fields
        
        $submission = \App\Models\FormSubmission::create([
            'tenant_id' => resolve('current_tenant_id'),
            'form_template_id' => $template->id,
            'data' => $request->all(),
            'status' => 'pending'
        ]);

        return response()->json([
            'message' => 'Submission received successfully.',
            'data' => $submission
        ], 201);
    }
}
