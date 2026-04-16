import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  error: string;
}

export const TenantErrorFallback: React.FC<Props> = ({ error }) => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-50)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '500px' }}>
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#EF4444',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <AlertCircle size={32} />
        </div>
        
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Erreur de Configuration</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {error || "Nous n'avons pas pu charger les paramètres de votre établissement scolaire. Veuillez vérifier votre connexion ou l'URL saisie."}
        </p>
        
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          <RefreshCw size={18} />
          Réessayer
        </button>
      </div>
    </div>
  );
};
