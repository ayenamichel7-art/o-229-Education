<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains, HasFactory;

    /**
     * The attributes that are mass assignable.
     * Note: stancl/tenancy uses a 'data' column in DB to store extra attributes 
     * by default unless we use a custom table.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'slug',
            'email',
            'phone',
            'address',
            'logo_url',
            'favicon_url',
            'hero_image_url',
            'primary_color',
            'secondary_color',
            'accent_color',
            'font_family',
            'tagline',
            'description',
            'currency',
            'timezone',
            'locale',
            'is_active',
            'settings',
            'subscription_plan',
            'subscription_expires_at',
        ];
    }

    protected $casts = [
        'is_active'                => 'boolean',
        'settings'                 => 'array',
        'subscription_expires_at'  => 'datetime',
    ];

    // ─── Helpers ─────────────────────────────────────────

    public function getBrandingConfig(): array
    {
        return [
            'school_name'     => $this->name,
            'tagline'         => $this->tagline,
            'logo_url'        => $this->logo_url,
            'favicon_url'     => $this->favicon_url,
            'hero_image_url'  => $this->hero_image_url,
            'primary_color'   => $this->primary_color ?? '#1E40AF',
            'secondary_color' => $this->secondary_color ?? '#F59E0B',
            'accent_color'    => $this->accent_color ?? '#10B981',
            'font_family'     => $this->font_family ?? 'Inter',
            'currency'        => $this->currency ?? 'XOF',
            'features'        => [
                'finance'    => $this->hasFeature('finance'),
                'grading'    => $this->hasFeature('grading'),
                'attendance' => $this->hasFeature('attendance'),
                'mobile_app' => $this->hasFeature('mobile_app'),
                'reports'    => $this->hasFeature('reports'),
                'audit'      => $this->hasFeature('audit'),
            ]
        ];
    }

    public function hasFeature(string $feature): bool
    {
        $features = $this->settings['features'] ?? [];
        if (isset($features[$feature])) {
            return (bool) $features[$feature];
        }

        return match ($this->subscription_plan) {
            'free'     => in_array($feature, ['admission', 'vitrine']),
            'premium'  => in_array($feature, ['admission', 'vitrine', 'finance', 'grading']),
            'ultimate' => true,
            default    => false,
        };
    }
}
