import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, UserPlus, CreditCard, Activity, Download } from 'lucide-react';
import { useTenant } from '../providers/TenantProvider';
// import { apiClient } from '../api/apiClient';

const kpiData = [
  { name: 'Sep', students: 400, revenue: 120000 },
  { name: 'Oct', students: 430, revenue: 132000 },
  { name: 'Nov', students: 440, revenue: 135000 },
  { name: 'Dec', students: 450, revenue: 140000 },
  { name: 'Jan', students: 480, revenue: 155000 },
  { name: 'Feb', students: 510, revenue: 168000 },
  { name: 'Mar', students: 550, revenue: 182000 },
];

export const Dashboard: React.FC = () => {
  const { tenant } = useTenant();
  const [stats] = useState({ total_students: 550, active_teachers: 32, monthly_revenue: 182000, pending_admissions: 14 });
  const [isDownloading, setIsDownloading] = useState(false);

  // Here, we would fetch KPIs using `apiClient.get('/dashboard/kpis')`
  
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    // Simulate robot report generation
    await new Promise(res => setTimeout(res, 1500));
    setIsDownloading(false);
    alert('Le rapport PDF/Excel généré par le robot a été téléchargé avec succès.');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--surface-900)', fontSize: '2rem', marginBottom: '0.25rem' }}>Tableau de bord</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenue dans l'espace de gestion de {tenant?.name || "l'école"}.</p>
        </div>
        <button 
          onClick={handleDownloadReport} 
          disabled={isDownloading} 
          className="btn" 
          style={{ background: 'white', border: '1px solid var(--surface-200)', boxShadow: 'var(--shadow-sm)', color: 'var(--primary)' }}
        >
          <Download size={18} /> {isDownloading ? 'Génération...' : 'Télécharger Rapport'}
        </button>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <StatCard icon={<Users size={24} color="var(--primary)" />} title="Élèves Inscrits" value={stats.total_students} diff="+12%" />
        <StatCard icon={<Activity size={24} color="#10B981" />} title="Professeurs" value={stats.active_teachers} diff="+2" />
        <StatCard icon={<CreditCard size={24} color="#F59E0B" />} title="Revenus Mensuels" value={`${(stats.monthly_revenue / 1000).toFixed(1)}k €`} diff="+8.4%" />
        <StatCard icon={<UserPlus size={24} color="#EF4444" />} title="Admissions en attente" value={stats.pending_admissions} />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Main Chart */}
        <div className="glass-card" style={{ padding: '1.5rem', background: 'white', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--surface-800)' }}>Évolution des Inscriptions et Revenus</h3>
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
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--surface-800)' }}>Répartition par niveau</h3>
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
