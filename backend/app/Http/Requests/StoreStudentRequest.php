<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super-admin', 'admin', 'director', 'secretary']);
    }

    public function rules(): array
    {
        return [
            'first_name'    => ['required', 'string', 'max:100'],
            'last_name'     => ['required', 'string', 'max:100'],
            'email'         => ['nullable', 'email', 'max:255'],
            'phone'         => ['nullable', 'string', 'max:20'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender'        => ['nullable', 'in:male,female,other'],
            'address'       => ['nullable', 'string', 'max:500'],
            'class_id'      => ['nullable', 'integer', 'exists:school_classes,id'],
            'guardian_name' => ['nullable', 'string', 'max:200'],
            'guardian_phone'=> ['nullable', 'string', 'max:20'],
            'guardian_email'=> ['nullable', 'email', 'max:255'],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ];
    }
}
