import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  ShieldCheck, 
  Settings, 
  QrCode, 
  Share2, 
  Monitor, 
  ChevronRight,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface MobileAppData {
  app_name: string;
  package_name: string;
  status: 'not_created' | 'pending' | 'building' | 'active' | 'deactivated';
  apk_url?: string;
  config: {
    primary_color: string;
    secondary_color: string;
  };
  last_build_at?: string;
}

export const MobileAppPage: React.FC = () => {
  const [appData, setAppData] = useState<MobileAppData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    setAppData({
      app_name: "Lycée Excellence Mobile",
      package_name: "com.o229.lycee-excellence",
      status: 'active',
      apk_url: "https://storage.o-229.com/builds/com.o229.lycee-excellence.apk",
      config: {
        primary_color: "#1E40AF",
        secondary_color: "#F59E0B"
      },
      last_build_at: "2026-03-12 14:30:00"
    });
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleBuildRequest = () => {
    setIsBuilding(true);
    if (appData) setAppData({ ...appData, status: 'building' });
    setTimeout(() => {
      setIsBuilding(false);
      if (appData) setAppData({ 
        ...appData, 
        status: 'active', 
        last_build_at: new Date().toISOString(),
        apk_url: "https://storage.o-229.com/builds/new-version.apk"
      });
    }, 5000);
  };

  if (!appData) return <div>Chargement...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <div className="glass-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2.5rem', padding: '3rem', background: 'linear-gradient(135deg, white 0%, #f8faff 100%)' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          background: 'var(--primary)', 
          borderRadius: '30px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(30, 64, 175, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Smartphone size={56} color="white" />
          <div style={{ position: 'absolute', bottom: -10, right: -10, width: 50, height: 50, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
             <h1 style={{ margin: 0 }}>Solution Mobile Multi-Canal</h1>
             <span style={{ padding: '0.4rem 1rem', background: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>PREMIUM</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Distribuez votre application sans passer par le Play Store grâce aux QR Codes et à la technologie PWA.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           <button className="btn btn-primary" onClick={handleBuildRequest} disabled={isBuilding}>
              <RefreshCw size={18} className={isBuilding ? 'animate-spin' : ''} />
              {isBuilding ? 'Compilation...' : 'Compiler l\'App'}
           </button>
           <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>V. {appData.package_name}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Left Column: Solution 1 & 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section Solution 1: Distribution Directe / QR Code */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                  <QrCode size={22} /> Solution 1 : Distribution par QR Code
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Affichez ce code dans l'établissement pour un téléchargement instantané.</p>
              </div>
              <button className="btn" style={{ background: '#f1f5f9', padding: '0.5rem' }} title="Imprimer pour affichage">
                <Printer size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: '#f8fafc', padding: '2rem', borderRadius: '20px' }}>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '15px', boxShadow: 'var(--shadow-md)' }}>
                <QRCodeSVG value={appData.apk_url || "https://o-229.com"} size={160} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.25rem' }}>Lien de l'APK</div>
                  <code style={{ background: '#eee', padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem', display: 'block', wordBreak: 'break-all' }}>
                    {appData.apk_url}
                  </code>
                </div>
                <button className="btn" style={{ width: '100%', background: 'white', border: '1px solid #ddd', fontSize: '0.9rem' }}>
                  <Share2 size={16} /> Copier le lien de partage
                </button>
              </div>
            </div>
          </div>

          {/* Section Solution 2: PWA */}
          <div className="glass-card" style={{ padding: '2rem', borderLeft: '4px solid #0891b2' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0891b2' }}>
              <Monitor size={22} /> Solution 2 : Progressive Web App (PWA)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
              Transformez votre site web en application installable sans fichier APK. Idéal pour iPhone et Android.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: '#ecfeff', padding: '1.25rem', borderRadius: '12px' }}>
                <CheckCircle size={18} color="#0891b2" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Installation Native</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>S'ajoute à l'écran d'accueil comme une vraie app.</div>
              </div>
              <div style={{ background: '#ecfeff', padding: '1.25rem', borderRadius: '12px' }}>
                <CheckCircle size={18} color="#0891b2" style={{ marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Mises à jour Web</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Les parents ont toujours la dernière version.</div>
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px dashed #0891b2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem' }}>État du Service Worker : <strong>Actif & Sécurisé (SSL)</strong></span>
              <button style={{ background: 'none', border: 'none', color: '#0891b2', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                Tester le manifest <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Configuration Visuelle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Settings size={20} /> Personnalisation visuelle
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Couleur de thème (Barre d'état)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="color" value={appData.config.primary_color} style={{ width: '40px', height: '40px', border: 'none', background: 'none' }} />
                <input type="text" value={appData.config.primary_color} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '15px' }}>
               <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>Aperçu de l'icône</p>
               <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: 60, height: 60, background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>{appData.app_name.charAt(0)}</div>
                  </div>
                  <div style={{ width: 60, height: 60, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>{appData.app_name.charAt(0)}</div>
                  </div>
                  <div style={{ flex: 1, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Les icônes sont générées automatiquement en formats <strong>Carré</strong> et <strong>Adaptive</strong> pour Android 13+.
                  </div>
               </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={handleSave}>
               Sauvegarder les paramètres visuels
            </button>
          </div>

          <div className="glass-card" style={{ background: 'var(--surface-900)', color: 'white', padding: '2.5rem', textAlign: 'center' }}>
             <ShieldCheck size={48} color="#10B981" style={{ marginBottom: '1rem' }} />
             <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Protection o-229</h4>
             <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
               Toutes les applications générées utilisent le protocole HTTPS et l'authentification sécurisée de notre plateforme. Aucune donnée n'est stockée sur l'appareil de manière non cryptée.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};
