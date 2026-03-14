import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTenant } from '../providers/TenantProvider';
import { GraduationCap } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { tenant, isLoading, error } = useTenant();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--primary)' }}>
        Loading School Vitrine...
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        {error || 'School not found (Invalid Subdomain)'}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Branded Header */}
      <header style={{ 
        padding: '1.5rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--surface-100)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontWeight: 800, fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} alt={`${tenant.name} Logo`} style={{ height: '40px' }} />
          ) : (
            <GraduationCap size={32} />
          )}
          {tenant.name}
        </div>
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontWeight: 600 }}>
          <a href="#" style={{ color: 'var(--text-main)' }}>Programs</a>
          <a href="/admission" style={{ color: 'var(--text-main)' }}>Admissions</a>
          <a href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
            Portail ERP
          </a>
        </nav>
      </header>

      {/* Pages render here securely inheriting the layout & dynamic branding */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', background: 'var(--surface-900)', color: 'white', textAlign: 'center' }}>
        <div style={{ marginBottom: '1rem', fontWeight: 600 }}>{tenant.name}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} {tenant.name}. All rights reserved.<br/>
          <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Powered by o-229 Education Platform</span>
        </div>
      </footer>
    </div>
  );
};
