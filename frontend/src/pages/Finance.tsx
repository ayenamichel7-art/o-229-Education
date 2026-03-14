import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface Payment {
  id: number;
  student_name: string;
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

export const Finance: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const stats = {
    total_collected: 4250000,
    pending: 820000,
    overdue: 340000,
    this_month: 1200000,
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/payments');
        setPayments(res.data.data || []);
      } catch {
        setPayments([
          { id: 1, student_name: 'Amara Diallo', amount: 150000, type: 'Scolarité', status: 'paid', date: '2026-03-01' },
          { id: 2, student_name: 'Fatou Koné', amount: 150000, type: 'Scolarité', status: 'paid', date: '2026-03-02' },
          { id: 3, student_name: 'Moussa Traoré', amount: 75000, type: 'Transport', status: 'pending', date: '2026-03-05' },
          { id: 4, student_name: 'Awa Camara', amount: 150000, type: 'Scolarité', status: 'overdue', date: '2026-02-15' },
          { id: 5, student_name: 'Ibrahim Sylla', amount: 50000, type: 'Cantine', status: 'paid', date: '2026-03-10' },
          { id: 6, student_name: 'Kadia Bamba', amount: 150000, type: 'Scolarité', status: 'pending', date: '2026-03-08' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const formatCFA = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    paid: { color: '#059669', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={14} />, label: 'Payé' },
    pending: { color: '#d97706', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={14} />, label: 'En attente' },
    overdue: { color: '#dc2626', bg: 'rgba(239,68,68,0.1)', icon: <AlertCircle size={14} />, label: 'En retard' },
  };

  return (
    <div className="erp-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
            <CreditCard size={28} style={{ marginRight: 12, verticalAlign: 'middle' }} />
            Module Financier
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginTop: 4 }}>Suivi des paiements et facturation</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
          <Download size={18} /> Exporter PDF
        </button>
      </div>

      {/* KPIs financiers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Collecté', value: formatCFA(stats.total_collected), icon: <DollarSign size={22} />, color: '#10b981', trend: '+12%', trendIcon: <TrendingUp size={14} /> },
          { label: 'Ce Mois', value: formatCFA(stats.this_month), icon: <TrendingUp size={22} />, color: '#3b82f6', trend: '+8%', trendIcon: <TrendingUp size={14} /> },
          { label: 'En Attente', value: formatCFA(stats.pending), icon: <Clock size={22} />, color: '#f59e0b', trend: '-3%', trendIcon: <TrendingDown size={14} /> },
          { label: 'En Retard', value: formatCFA(stats.overdue), icon: <AlertCircle size={22} />, color: '#ef4444', trend: '+2%', trendIcon: <TrendingUp size={14} /> },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(16px)',
            borderRadius: 16,
            padding: 24,
            border: '1px solid rgba(0,0,0,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ background: `${kpi.color}15`, padding: 10, borderRadius: 12, color: kpi.color }}>{kpi.icon}</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: kpi.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                {kpi.trendIcon} {kpi.trend}
              </span>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>{kpi.value}</p>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 4 }}>{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tableau des paiements */}
      <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600, fontSize: '1.1rem' }}>
          Derniers Paiements
        </div>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Chargement...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                {['Élève', 'Type', 'Montant', 'Date', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const sc = statusConfig[p.status];
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.03)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{p.student_name}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem' }}>{p.type}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{formatCFA(p.amount)}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem' }}>{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
