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
            'seal_url',
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
            'google_place_id',
            'latitude',
            'longitude',
            'google_maps_url',
            'has_google_business',
            'google_business_verified',
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
            'name'            => $this->name,
            'tagline'         => $this->tagline,
            'logoUrl'         => $this->logo_url,
            'sealUrl'         => $this->seal_url,
            'faviconUrl'      => $this->favicon_url,
            'heroImageUrl'    => $this->hero_image_url,
            'primaryColor'    => $this->primary_color ?? '#1E40AF',
            'secondaryColor'  => $this->secondary_color ?? '#F59E0B',
            'accentColor'     => $this->accent_color ?? '#10B981',
            'fontFamily'      => $this->font_family ?? 'Inter',
            'currency'        => $this->currency ?? 'XOF',
            'features'        => [
                'finance'    => $this->hasFeature('finance'),
                'grading'    => $this->hasFeature('grading'),
                'attendance' => $this->hasFeature('attendance'),
                'mobile_app' => $this->hasFeature('mobile_app'),
                'reports'    => $this->hasFeature('reports'),
                'audit'      => $this->hasFeature('audit'),
            ],
            'location'        => [
                'address'         => $this->address,
                'google_place_id' => $this->google_place_id,
                'latitude'        => $this->latitude,
                'longitude'       => $this->longitude,
                'maps_url'        => $this->google_maps_url,
                'is_verified'     => (bool) $this->google_business_verified,
            ]
        ];
    }

    /**
     * Check if Google Business is configured.
     * Used for forcing schools to create their profile.
     */
    public function isGoogleBusinessConfigured(): bool
    {
        return !empty($this->google_place_id) || !empty($this->google_maps_url);
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
