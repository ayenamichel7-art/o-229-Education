import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useTenant } from '../providers/TenantProvider';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-50)' }}>
      {/* Left side: Branding / Image */}
      <div style={{ 
        flex: 1, 
        background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4rem',
        color: 'white'
      }}>
        {tenant?.logoUrl && <img src={tenant.logoUrl} alt="Logo" style={{ height: '80px', marginBottom: '2rem' }} />}
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'white' }}>{tenant?.name || 'o-229 ERP'}</h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.8, textAlign: 'center', maxWidth: '400px' }}>
          Connectez-vous à votre espace sécurisé OMI.
        </p>
      </div>

      {/* Right side: Login Form */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
              <LogIn size={32} />
            </div>
            <h2>Bienvenue</h2>
            <p style={{ color: 'var(--text-muted)' }}>Entrez vos identifiants pour continuer</p>
          </div>

          {error && (
            <div style={{ padding: '1rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={labelStyle}>Adresse e-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="admin@ecole.com"
              />
            </div>

            <div>
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="/" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>&larr; Retourner au site de l'école</a>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: '0.95rem',
  color: 'var(--surface-800)',
  marginBottom: '0.5rem',
  display: 'block'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid #CBD5E1',
  fontFamily: 'var(--font-sans)',
  fontSize: '1rem',
  color: 'var(--surface-900)',
  outline: 'none',
  background: 'var(--surface-50)'
};
