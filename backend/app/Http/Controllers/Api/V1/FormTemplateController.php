<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use App\Models\FormSubmission;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FormTemplateController extends Controller
{
    /**
     * Display a listing of active form templates.
     */
    public function index()
    {
        $templates = FormTemplate::where('is_active', true)->get();
        return response()->json(['data' => $templates]);
    }

    /**
     * Display the specified resource with fields grouped by section.
     */
    public function show(string $id)
    {
        $template = FormTemplate::with(['fields' => function($query) {
            $query->orderBy('order');
        }])->findOrFail($id);

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
     * Submit form data with dynamic validation.
     */
    public function submit(Request $request, string $id)
    {
        $template = FormTemplate::with('fields')->findOrFail($id);

        // Build dynamic validation rules from template fields
        $rules = [];
        foreach ($template->fields as $field) {
            $fieldRules = [];
            
            if ($field->is_required) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            // Type-based rules
            match ($field->type) {
                'email'  => $fieldRules[] = 'email',
                'number' => $fieldRules[] = 'numeric',
                'date'   => $fieldRules[] = 'date',
                'phone'  => $fieldRules[] = 'string|max:20',
                'file'   => $fieldRules[] = 'file|max:5120', // 5MB max
                default  => $fieldRules[] = 'string|max:1000',
            };

            $rules["fields.{$field->name}"] = $fieldRules;
        }

        if (!empty($rules)) {
            $request->validate($rules);
        }
        
        $submission = FormSubmission::create([
            'form_template_id' => $template->id,
            'data' => $request->input('fields', $request->all()),
            'status' => 'pending',
            'ip_address' => $request->ip(),
        ]);

        $paymentUrl = null;
        if ($template->requires_payment && $template->registration_fee > 0) {
            // Create a temporary payment for this submission
            $payment = Payment::create([
                'academic_year_id' => $template->academic_year_id,
                'amount'           => $template->registration_fee,
                'amount_paid'      => 0,
                'type'             => 'registration',
                'status'           => 'pending',
                'payment_method'   => 'mobile_money',
                'notes'            => "Frais d'inscription via formulaire: " . $template->name,
                'reference_number' => 'REG-' . strtoupper(Str::random(8)),
            ]);

            // Track submission in payment metadata or similar
            // For now, we generate the gateway link
            $transactionId = 'TXN-REG-' . strtoupper(Str::random(10));
            $paymentUrl = "https://checkout.local-gateway.africa/pay/" . $transactionId;

            $payment->update([
                'external_id' => $transactionId,
                'payment_url' => $paymentUrl
            ]);
        }

        return response()->json([
            'message' => 'Candidature reçue avec succès.',
            'data' => $submission,
            'payment_url' => $paymentUrl,
            'requires_payment' => (bool)$paymentUrl
        ], 201);
    }
}
