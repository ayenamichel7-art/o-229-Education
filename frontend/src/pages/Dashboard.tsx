import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, UserPlus, CreditCard, Activity, Download, AlertTriangle, ExternalLink } from 'lucide-react';
import { useTenant } from '../providers/TenantProvider';
import { apiClient } from '../api/apiClient';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { tenant } = useTenant();
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total_students: 0, active_teachers: 0, monthly_revenue: 0, pending_admissions: 0, growth_yoy: 0, collection_rate: 0 });
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const [gmbStatus, setGmbStatus] = useState<{ configured: boolean; message: string; action_url: string } | null>(null);

  useEffect(() => {
    apiClient.get('/dashboard/kpis')
      .then(res => {
        if (res.data.meta?.google_business_status) {
          setGmbStatus(res.data.meta.google_business_status);
        }
        
        const d = res.data.data;
        if (d) {
           setStats({
              total_students: d.enrollment?.total_students || 0,
              active_teachers: d.staff?.active_teachers || 0,
              monthly_revenue: d.financial?.total_collected || 0,
              pending_admissions: d.enrollment?.new_this_month || 0,
              growth_yoy: d.enrollment?.growth_yoy || 0,
              collection_rate: d.financial?.collection_rate || 0
           });

           if (d.financial?.monthly_revenue) {
              const revMap = d.financial.monthly_revenue;
              const formattedKpis = Object.keys(revMap).map(key => {
                 const [, month] = key.split('-');
                 const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                 return {
                    name: monthNames[parseInt(month) - 1],
                    students: d.enrollment?.total_students || 0,
                    revenue: parseInt(revMap[key])
                 };
              });
              setKpiData(formattedKpis.length > 0 ? formattedKpis.slice(-7) : []);
           }
        }
      })
      .catch(err => {
        console.error('Failed to fetch dashboard meta', err);
        toast.error('Erreur lors du chargement des statistiques');
      });
  }, []);
  
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    // Simulate robot report generation
    await new Promise(res => setTimeout(res, 1500));
    setIsDownloading(false);
    alert('Le rapport PDF/Excel généré par le robot a été téléchargé avec succès.');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Google My Business Alert Banner */}
      {gmbStatus && !gmbStatus.configured && (
        <div style={{ 
          background: '#FFFBEB', 
          border: '1px solid #F59E0B', 
          borderRadius: 'var(--radius-lg)', 
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#F59E0B', color: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p style={{ color: '#92400E', fontWeight: 600, fontSize: '0.95rem' }}>Configuration Requise</p>
              <p style={{ color: '#B45309', fontSize: '0.875rem' }}>{gmbStatus.message}</p>
            </div>
          </div>
          <a 
            href={gmbStatus.action_url} 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          >
            Configurer maintenant <ExternalLink size={14} style={{ marginLeft: '0.5rem' }} />
          </a>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--surface-900)', fontSize: '2rem', marginBottom: '0.25rem' }}>{t('dashboard.header_title')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('dashboard.header_subtitle', { name: tenant?.name || t('common.school') })}</p>
        </div>
        <button 
          onClick={handleDownloadReport} 
          disabled={isDownloading} 
          className="btn" 
          style={{ background: 'white', border: '1px solid var(--surface-200)', boxShadow: 'var(--shadow-sm)', color: 'var(--primary)' }}
        >
          <Download size={18} /> {isDownloading ? t('common.generate') : t('common.download_report')}
        </button>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <StatCard icon={<Users size={24} color="var(--primary)" />} title={t('dashboard.registered_students')} value={stats.total_students} diff={stats.growth_yoy > 0 ? `+${stats.growth_yoy}%` : `${stats.growth_yoy}%`} />
        <StatCard icon={<Activity size={24} color="#10B981" />} title={t('dashboard.teachers')} value={stats.active_teachers} />
        <StatCard icon={<CreditCard size={24} color="#F59E0B" />} title={t('dashboard.monthly_revenue')} value={`${(stats.monthly_revenue / 1000).toFixed(1)}k €`} diff={`${stats.collection_rate}% recouvrés`} />
        <StatCard icon={<UserPlus size={24} color="#EF4444" />} title={t('dashboard.pending_admissions')} value={stats.pending_admissions} />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'white', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--surface-800)' }}>{t('dashboard.evolution_chart')}</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={kpiData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '5 5' }}
              />
              <Area yAxisId="left" type="monotone" dataKey="students" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
              <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'white', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--surface-800)' }}>{t('dashboard.distribution_chart')}</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={[ { name: 'Maternelles', val: 120 }, { name: 'Primaires', val: 240 }, { name: 'Collégiens', val: 190 } ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
              <Tooltip cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Bar dataKey="val" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

// Helper component
const StatCard = ({ icon, title, value, diff }: { icon: React.ReactNode, title: string, value: string | number, diff?: string }) => (
  <div className="glass-card" style={{ padding: '1.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ background: 'var(--surface-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
        {icon}
      </div>
      {diff && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: diff.startsWith('+') ? '#10B981' : '#EF4444', background: diff.startsWith('+') ? '#D1FAE5' : '#FEE2E2', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
          {diff}
        </span>
      )}
    </div>
    <div>
      <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</h4>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--surface-900)' }}>{value}</div>
    </div>
  </div>
);
