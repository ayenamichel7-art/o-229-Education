<?php

namespace App\Models;

use App\Models\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory, Auditable;

    protected $fillable = [
        'user_id',
        'matricule',
        'date_of_birth',
        'birth_place',
        'country_origin',
        'gender',
        'address',
        'pickup_authorization_type',
        'pickup_contact_name',
        'media_authorization',
        'guardian_name',
        'guardian_phone',
        'guardian_email',
        'guardian_relationship',
        'guardian_profession',
        'blood_group',
        'medical_notes',
        'enrollment_date',
        'class_id',
        'academic_year_id',
        'status', // active, graduated, transferred, expelled
        'family_situation',
        'handicap_type',
        'photo_url',
        'doc_birth_certificate_url',
        'doc_report_card_url',
        'doc_school_certificate_url',
        'doc_passport_photo_url',
        'doc_exam_result_url',
        'doc_medical_certificate_url',
    ];

    protected $casts = [
        'date_of_birth'   => 'date',
        'enrollment_date' => 'date',
        'media_authorization' => 'boolean',
        'address' => 'encrypted',
        'guardian_phone' => 'encrypted',
        'guardian_email' => 'encrypted',
        'birth_place' => 'encrypted',
        'medical_notes' => 'encrypted',
    ];

    // ─── Relationships ───────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }
}
