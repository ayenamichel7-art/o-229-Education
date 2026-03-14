<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * StudentResource — Never exposes internal IDs or tenant_id.
 */
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'matricule'             => $this->matricule,
            'first_name'            => $this->user?->first_name,
            'last_name'             => $this->user?->last_name,
            'email'                 => $this->user?->email,
            'phone'                 => $this->user?->phone,
            'avatar_url'            => $this->user?->avatar_url,
            'date_of_birth'         => $this->date_of_birth?->format('Y-m-d'),
            'gender'                => $this->gender,
            'address'               => $this->address,
            'guardian_name'         => $this->guardian_name,
            'guardian_phone'        => $this->guardian_phone,
            'guardian_email'        => $this->guardian_email,
            'guardian_relationship' => $this->guardian_relationship,
            'class'                 => $this->whenLoaded('schoolClass', fn() => [
                'id'   => $this->schoolClass->id,
                'name' => $this->schoolClass->name,
            ]),
            'status'                => $this->status,
            'enrollment_date'       => $this->enrollment_date?->format('Y-m-d'),
            'grades'                => $this->whenLoaded('grades'),
            'payments'              => PaymentResource::collection($this->whenLoaded('payments')),
            'created_at'            => $this->created_at?->toISOString(),
        ];
    }
}
