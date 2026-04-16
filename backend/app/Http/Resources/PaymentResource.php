<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'student'          => $this->whenLoaded('student', fn() => [
                'id'        => $this->student->id,
                'matricule' => $this->student->matricule,
                'name'      => $this->student->user?->full_name,
            ]),
            'amount'           => (float) $this->amount,
            'amount_paid'      => (float) $this->amount_paid,
            'balance'          => (float) $this->balance,
            'due_date'         => $this->due_date?->format('Y-m-d'),
            'paid_at'          => $this->paid_at?->toISOString(),
            'payment_method'   => $this->payment_method,
            'reference_number' => $this->reference_number,
            'type'             => $this->type,
            'status'           => $this->status,
            'is_overdue'       => $this->isOverdue(),
            'payment_url'      => $this->payment_url,
            'external_id'      => $this->external_id,
            'notes'            => $this->notes,
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
