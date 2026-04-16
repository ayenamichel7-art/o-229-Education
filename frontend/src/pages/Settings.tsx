import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Globe, 
  Search, 
  Save, 
  Loader2,
  ExternalLink,
  Palette,
  Download,
  Upload,
  Info,
  Check
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
  const [reportPrimaryColor, setReportPrimaryColor] = useState('#1E40AF');
  const [reportHeaderStyle, setReportHeaderStyle] = useState('classic');
  const [sealUrl, setSealUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSeal, setIsUploadingSeal] = useState(false);

  useEffect(() => {
    if (tenant?.location) {
      setAddress(tenant.location.address || '');
      setPlaceId(tenant.location.google_place_id || '');
    }
    if (tenant?.settings?.report_card) {
      setReportPrimaryColor(tenant.settings.report_card.primary_color || '#1E40AF');
      setReportHeaderStyle(tenant.settings.report_card.header_style || 'classic');
    }
    if (tenant?.sealUrl) {
      setSealUrl(tenant.sealUrl);
    }
    if (tenant?.logoUrl) {
      setLogoUrl(tenant.logoUrl);
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

  const handleSaveReportSettings = async () => {
    setIsSaving(true);
    const toastId = toast.loading('Sauvegarde du style du bulletin...');
    try {
      await apiClient.post('/tenant/report-settings', {
        primary_color: reportPrimaryColor,
        header_style: reportHeaderStyle
      });
      
      // Update Branding (Seal)
      await apiClient.post('/tenant/branding', {
        seal_url: sealUrl
      });

      toast.success('Style et Cachet mis à jour !', { id: toastId });
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadBrochure = async () => {
    const toastId = toast.loading('Génération de la brochure...');
    try {
      window.open(`${apiClient.defaults.baseURL}/tenant/brochure`, '_blank');
      toast.success('Brochure générée avec succès !', { id: toastId });
    } catch (err) {
      toast.error('Erreur lors de la génération.', { id: toastId });
    }
  };

  const handleFileUpload = async (type: 'logo' | 'seal', file: File) => {
    const isLogo = type === 'logo';
    const setter = isLogo ? setIsUploadingLogo : setIsUploadingSeal;
    const endpoint = isLogo ? '/tenant/upload-logo' : '/tenant/upload-seal';
    const formData = new FormData();
    formData.append(type, file);

    setter(true);
    const toastId = toast.loading(`Importation du ${isLogo ? 'logo' : 'cachet'}...`);

    try {
      const res = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (isLogo) setLogoUrl(res.data.url);
      else setSealUrl(res.data.url);
      toast.success('Fichier importé avec succès !', { id: toastId });
    } catch (err) {
      toast.error('Erreur lors de l\'importation.', { id: toastId });
    } finally {
      setter(false);
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

        {/* Report Card Branding Section */}
        <section className="glass-card" style={{ padding: '2rem', border: '1px solid var(--surface-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
              <Palette size={24} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Personnalisation des Bulletins</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Définissez l'apparence des documents officiels</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             
             {/* Logo & Seal Upload Row */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Logo Upload */}
                <div style={{ background: 'var(--surface-50)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-200)' }}>
                   <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '1rem' }}>Logo de l'Établissement</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '8px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                         {logoUrl ? <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <Globe size={32} color="var(--surface-300)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                         <input 
                           type="file" 
                           id="logo-upload" 
                           hidden 
                           accept="image/*" 
                           onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])} 
                         />
                         <button 
                           onClick={() => document.getElementById('logo-upload')?.click()}
                           disabled={isUploadingLogo}
                           className="btn btn-secondary"
                           style={{ width: '100%', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
                         >
                           {isUploadingLogo ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                           Changer le Logo
                         </button>
                      </div>
                   </div>
                   <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Info size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p>Recommandé : Format Carré (512x512px), PNG ou JPG, max 1Mo. Évitez les marges blanches excessives.</p>
                   </div>
                </div>

                {/* Seal Upload */}
                <div style={{ background: 'var(--surface-50)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-200)' }}>
                   <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '1rem' }}>Cachet ou Signature Officielle</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '8px', border: '1px solid var(--surface-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 0 5px, 5px 5px, 5px 0' }}>
                         {sealUrl ? <img src={sealUrl} alt="Seal" style={{ maxWidth: '100%', maxHeight: '100%' }} /> : <Palette size={32} color="var(--surface-300)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                         <input 
                           type="file" 
                           id="seal-upload" 
                           hidden 
                           accept="image/png" 
                           onChange={(e) => e.target.files?.[0] && handleFileUpload('seal', e.target.files[0])} 
                         />
                         <button 
                           onClick={() => document.getElementById('seal-upload')?.click()}
                           disabled={isUploadingSeal}
                           className="btn btn-secondary"
                           style={{ width: '100%', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
                         >
                           {isUploadingSeal ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                           Importer le Cachet
                         </button>
                      </div>
                   </div>
                   <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.75rem', border: '1px dashed #10B981', padding: '0.5rem', borderRadius: '8px', background: '#ecfdf5', color: '#065f46' }}>
                      <Check size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p><strong>Optimisation :</strong> Utilisez impérativement un format **PNG transparent** pour que le cachet se superpose naturellement aux documents.</p>
                   </div>
                </div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Couleur Principale (Documents)</label>
                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input 
                        type="color" 
                        value={reportPrimaryColor}
                        onChange={(e) => setReportPrimaryColor(e.target.value)}
                        style={{ width: '50px', height: '50px', border: 'none', background: 'transparent', cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        className="input" 
                        value={reportPrimaryColor}
                        onChange={(e) => setReportPrimaryColor(e.target.value)}
                        style={{ flex: 1, textTransform: 'uppercase' }}
                      />
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Style d'en-tête PDF</label>
                   <select 
                     className="input"
                     value={reportHeaderStyle}
                     onChange={(e) => setReportHeaderStyle(e.target.value)}
                   >
                     <option value="classic">Classique Professionnel</option>
                     <option value="modern">Moderne & Minimaliste</option>
                     <option value="simple">Simple Lite</option>
                   </select>
                </div>
             </div>

             <div style={{ 
               background: 'var(--surface-50)', 
               padding: '1.5rem', 
               borderRadius: '12px', 
               border: '1px dashed var(--surface-200)',
               display: 'flex',
               gap: '1rem',
               alignItems: 'center'
             }}>
                <div style={{ 
                  width: '60px', 
                  height: '80px', 
                  background: 'white', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                   <div style={{ background: reportPrimaryColor, height: '15px' }}></div>
                   <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ height: '4px', background: 'var(--surface-100)', width: '100%' }}></div>
                      <div style={{ height: '15px', background: reportPrimaryColor, width: '100%', marginTop: '5px' }}></div>
                   </div>
                   {sealUrl && (
                      <div style={{ 
                         position: 'absolute', 
                         bottom: '8px', 
                         right: '8px', 
                         width: '20px', 
                         height: '20px', 
                         background: 'rgba(59, 130, 246, 0.2)',
                         borderRadius: '2px',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontSize: '4px',
                         color: 'var(--primary)',
                         fontWeight: 'bold'
                      }}>STAMP</div>
                   )}
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                     <strong>Aperçu dynamique :</strong> Votre identité visuelle sera appliquée aux bulletins et brochures.
                   </p>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <Check size={12} /> Logo détecté
                      </span>
                      <span style={{ fontSize: '0.75rem', color: sealUrl ? '#10B981' : '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                         <Check size={12} /> {sealUrl ? 'Cachet configuré' : 'Cachet manquant'}
                      </span>
                   </div>
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button 
                  onClick={handleDownloadBrochure}
                  className="btn btn-secondary"
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                >
                  <Download size={18} />
                  Télécharger la Brochure
                </button>
                <button 
                  onClick={handleSaveReportSettings}
                  disabled={isSaving}
                  className="btn btn-primary"
                  style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Enregistrer les réglages
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
