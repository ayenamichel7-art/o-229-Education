import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Globe, 
  Search, 
  Save, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useTenant } from '../providers/TenantProvider';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (tenant?.location) {
      setAddress(tenant.location.address || '');
      setPlaceId(tenant.location.google_place_id || '');
    }
  }, [tenant]);

  const handleAutocomplete = async () => {
    if (!address) return;
    setIsSearching(true);
    const toastId = toast.loading('Recherche du lieu sur Google Maps...');

    try {
      const response = await apiClient.get(`/proxy/google-places?q=${encodeURIComponent(address)}`);
      
      if (response.data && response.data.place_id) {
        setPlaceId(response.data.place_id);
        toast.success(t('settings.success_find'), { id: toastId });
      } else {
        toast.error(t('settings.error_find'), { id: toastId });
      }
    } catch (err) {
      toast.error(t('settings.error_api'), { id: toastId });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Sauvegarde en cours...');
    try {
      await apiClient.post('/tenant/location', {
        address,
        google_place_id: placeId
      });
      toast.success(t('settings.success_save'), { id: toastId });
    } catch (err) {
      toast.error(t('settings.error_save'), { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--surface-900)', marginBottom: '0.5rem' }}>{t('settings.title')}</h1>
        <p style={{ color: 'var(--text-muted)' }}>{t('settings.subtitle')}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Google My Business & Maps Section */}
        <section className="glass-card" style={{ padding: '2rem', border: '1px solid var(--surface-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <MapPin size={24} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{t('settings.gmb_title')}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('settings.gmb_subtitle')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#0369A1', lineHeight: '1.5' }}>
                {t('settings.gmb_info')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('settings.address_label')}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder={t('settings.address_placeholder')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                <button 
                  onClick={handleAutocomplete}
                  disabled={isSearching || !address}
                  className="btn btn-secondary"
                  style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                  {t('settings.search_place_id')}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>{t('settings.place_id_label')}</label>
              <input 
                type="text" 
                className="input" 
                placeholder={t('settings.place_id_placeholder')}
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                readOnly
                style={{ background: 'var(--surface-50)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {t('settings.place_id_help')}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <a 
                href="https://www.google.com/business/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}
              >
                {t('settings.manage_gmb')} <ExternalLink size={14} />
              </a>
              <button 
                onClick={handleSave}
                disabled={isSaving || !placeId}
                className="btn btn-primary"
                style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1.5rem' }}
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {t('settings.save_changes')}
              </button>
            </div>
          </div>
        </section>

        {/* Visibility Preview */}
        <section className="glass-card" style={{ padding: '2rem', background: 'var(--surface-50)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('settings.preview_title')}</h3>
            <div style={{ 
                height: '200px', 
                background: '#e5e7eb', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed #d1d5db',
                color: 'var(--text-muted)',
                textAlign: 'center',
                padding: '2rem'
            }}>
                {placeId ? (
                    <div>
                        <MapPin size={32} color="var(--primary)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                        <p>{t('settings.preview_success', { name: tenant?.name })}</p>
                    </div>
                ) : (
                    <p>{t('settings.preview_empty')}</p>
                )}
            </div>
        </section>

      </div>
    </div>
  );
};
