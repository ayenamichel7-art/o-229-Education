import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Settings, FileText, Activity, Globe, Smartphone } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useTenant } from '../providers/TenantProvider';

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Chargement de l'ERP...</div>;
  }

  const navItems = [
    { label: 'Tableau de bord', icon: LayoutDashboard, path: '/app/dashboard' },
    { label: 'Admission & Élèves', icon: Users, path: '/app/students' },
    { label: 'Finances', icon: CreditCard, path: '/app/finance' },
    { label: 'Rapports', icon: FileText, path: '/app/reports' },
    { label: 'Site Vitrine (A à Z)', icon: Globe, path: '/app/vitrine-builder' },
    { label: 'Formulaires', icon: FileText, path: '/app/form-builder' },
    { label: 'Mon App Mobile', icon: Smartphone, path: '/app/mobile-app' },
    { label: 'Audit Trail', icon: Activity, path: '/app/audit' },
    { label: 'Configuration', icon: Settings, path: '/app/settings' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface-50)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'var(--surface-900)', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt="Logo" style={{ height: '32px' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)' }} />
          )}
          <span style={{ fontWeight: 700, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
            {tenant?.name || 'o-229'}
          </span>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition)'
                }}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.roles?.[0] || 'Utilisateur'}</div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(255,255,255,0.05)', color: '#FCA5A5', 
              border: 'none', padding: '0.8rem', borderRadius: 'var(--radius-md)',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 3rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
