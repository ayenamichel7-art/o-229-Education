<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_template_id',
        'label',
        'name',            // slug: "guardian_name"
        'type',            // text, email, tel, number, date, select, file, checkbox, textarea
        'placeholder',
        'options',         // JSON: for select/radio
        'validation_rules', // JSON: ["required", "max:255"]
        'order',
        'is_required',
        'section',         // Group: "student_info", "guardian_info", "documents"
    ];

    protected $casts = [
        'options'          => 'array',
        'validation_rules' => 'array',
        'is_required'      => 'boolean',
        'order'            => 'integer',
    ];

    public function formTemplate(): BelongsTo
    {
        return $this->belongsTo(FormTemplate::class);
    }
}
