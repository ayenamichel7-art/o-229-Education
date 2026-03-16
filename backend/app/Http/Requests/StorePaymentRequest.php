<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super-admin', 'admin', 'director', 'accountant']);
    }

    public function rules(): array
    {
        return [
            'student_id'     => ['required', 'integer', 'exists:students,id'],
            'amount'         => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'payment_method' => ['required', 'string', 'in:cash,bank_transfer,mobile_money,check,online'],
            'description'    => ['nullable', 'string', 'max:500'],
            'paid_at'        => ['nullable', 'date'],
            'reference'      => ['nullable', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.max' => 'Le montant ne peut pas dépasser 99 999 999,99.',
            'amount.min' => 'Le montant doit être positif.',
        ];
    }
}
