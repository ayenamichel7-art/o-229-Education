import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Settings, FileText, Activity, Globe, Smartphone, MessageSquare, ShieldAlert, Bus, Package, GraduationCap } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import { useTenant } from '../providers/TenantProvider';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const AppLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuth();
  const { tenant } = useTenant();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

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
    { label: t('common.dashboard'), icon: LayoutDashboard, path: '/app/dashboard', roles: ['super-admin', 'admin-school', 'director', 'accountant', 'teacher'] },
    { label: t('common.students'), icon: Users, path: '/app/students', roles: ['super-admin', 'admin-school', 'director', 'teacher'] },
    { label: 'Emploi du temps', icon: Activity, path: '/app/timetable', roles: ['super-admin', 'admin-school', 'director', 'teacher'] },
    { label: 'Cahier de texte', icon: FileText, path: '/app/pedagogy', roles: ['super-admin', 'admin-school', 'director', 'teacher'] },
    { label: 'Exams & Notes', icon: Activity, path: '/app/exams', roles: ['super-admin', 'admin-school', 'director', 'teacher'] },
    { label: 'Communication', icon: MessageSquare, path: '/app/communication', roles: ['super-admin', 'admin-school', 'director'] },
    { label: 'CRM Parents', icon: Users, path: '/app/crm-parents', roles: ['super-admin', 'admin-school', 'director'] },
    { label: 'Discipline', icon: ShieldAlert, path: '/app/discipline', roles: ['super-admin', 'admin-school', 'director'] },
    { label: 'Services (Transport/Cantine)', icon: Bus, path: '/app/services', roles: ['super-admin', 'admin-school', 'director'] },
    { label: 'Inventaire & Stocks', icon: Package, path: '/app/inventory', roles: ['super-admin', 'admin-school', 'director', 'accountant'] },
    { label: t('common.finance'), icon: CreditCard, path: '/app/finance', roles: ['super-admin', 'admin-school', 'director', 'accountant'] },
    { label: t('common.reports'), icon: FileText, path: '/app/reports', roles: ['super-admin', 'admin-school', 'director', 'accountant'] },
    { label: t('common.vitrine_builder'), icon: Globe, path: '/app/vitrine-builder', roles: ['super-admin', 'admin-school', 'director'] },
    { label: t('common.form_builder'), icon: FileText, path: '/app/form-builder', roles: ['super-admin', 'admin-school', 'director'] },
    { label: t('common.mobile_app'), icon: Smartphone, path: '/app/mobile-app', roles: ['super-admin', 'admin-school'] },
    { label: t('common.audit_trail'), icon: Activity, path: '/app/audit', roles: ['super-admin', 'admin-school'] },
    { label: t('common.settings'), icon: Settings, path: '/app/settings', roles: ['super-admin', 'admin-school', 'director', 'accountant', 'teacher'] },
    // Module Alumni additionnel
    { label: 'Réseau Professionnel', icon: GraduationCap, path: '/app/alumni', roles: ['super-admin', 'admin-school', 'director', 'student'] },
  ];

  const userRoles = user?.roles || [];
  const filteredNavItems = navItems.filter(item => 
    item.roles.some(role => userRoles.includes(role))
  );

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
          {filteredNavItems.map((item) => {
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
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.roles?.[0] || 'Utilisateur'}</div>
            </div>
            <LanguageSwitcher />
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
            <LogOut size={18} /> {t('common.logout')}
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
