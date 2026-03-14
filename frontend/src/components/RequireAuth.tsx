import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';

/**
 * RequireAuth — Route Guard
 * 
 * Wraps protected routes and redirects to /login if the user
 * is not authenticated. Preserves the intended destination so
 * the user can be redirected back after login.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth status (avoids flash of login page)
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-primary, #0f172a)',
        color: 'var(--text-primary, #e2e8f0)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '1rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s ease-in-out infinite',
            margin: '0 auto 16px',
          }} />
          <p>Chargement...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect to login, preserving intended route
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
