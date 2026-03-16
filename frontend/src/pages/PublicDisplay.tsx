import { MapPin } from 'lucide-react';
import { useTenant } from '../providers/TenantProvider';
import { useTranslation } from 'react-i18next';
import { SEO } from '../components/SEO';

export const PublicDisplay: React.FC = () => {
  const { tenant } = useTenant();
  const { t } = useTranslation();

  if (!tenant) return null;

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasLocation = tenant.location?.google_place_id || (tenant.location?.latitude && tenant.location?.longitude);

  return (
    <div className="animate-fade-in">
      <SEO 
        title={t('public.hero_title') || t('public.home')} 
        description={tenant.tagline || t('public.hero_subtitle')}
        path="/"
      />
      {/* ... Hero and Features sections ... */}
      
      {/* Location / Google Maps Section */}
      <section style={{ padding: '5rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem' }}>{t('public.find_us')}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>{t('public.find_us_sub')}</p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
            gap: '3rem',
            alignItems: 'start'
          }}>
            
            {/* Info Card */}
            <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <MapPin color="var(--primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('public.our_address')}</h4>
                  <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    {tenant.location?.address || t('public.no_address')}
                  </p>
                </div>
              </div>

              {tenant.location?.maps_url && (
                <a 
                  href={tenant.location.maps_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ alignSelf: 'start' }}
                >
                  {t('public.view_on_maps')}
                </a>
              )}
            </div>

            {/* Google Map Implementation */}
            <div style={{ 
              borderRadius: 'var(--radius-xl)', 
              overflow: 'hidden', 
              boxShadow: 'var(--shadow-lg)',
              height: '400px',
              background: 'var(--surface-100)',
              position: 'relative'
            }}>
              {hasLocation ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={tenant.location?.google_place_id 
                    ? `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=place_id:${tenant.location.google_place_id}`
                    : `https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=${tenant.location?.latitude},${tenant.location?.longitude}&zoom=15`
                  }
                ></iframe>
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <p style={{ color: 'var(--text-muted)' }}>{t('public.map_not_available')}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Footer / Contact Section */}
      <footer style={{ padding: '4rem 2rem', background: 'var(--surface-900)', color: 'white', textAlign: 'center' }}>
        <p>{t('public.powered_by', { year: new Date().getFullYear(), name: tenant.name })}</p>
      </footer>
    </div>
  );
};
