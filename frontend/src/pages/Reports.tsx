import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Eye, Clock, CheckCircle } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface Report {
  id: number;
  title: string;
  type: string;
  generated_by: string;
  status: 'completed' | 'processing' | 'scheduled';
  created_at: string;
  file_url: string | null;
}

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/reports');
        setReports(res.data.data || []);
      } catch {
        setReports([
          { id: 1, title: 'Rapport Financier - Mars 2026', type: 'Financier', generated_by: 'Robot Automatique', status: 'completed', created_at: '2026-03-10T14:30:00', file_url: '#' },
          { id: 2, title: 'Liste des Élèves par Classe', type: 'Académique', generated_by: 'Admin', status: 'completed', created_at: '2026-03-08T09:15:00', file_url: '#' },
          { id: 3, title: 'Rapport de Présence - Semaine 10', type: 'Présence', generated_by: 'Robot Automatique', status: 'completed', created_at: '2026-03-07T18:00:00', file_url: '#' },
          { id: 4, title: 'Bilan Trimestriel Q1 2026', type: 'Analytique', generated_by: 'Robot Automatique', status: 'processing', created_at: '2026-03-12T10:00:00', file_url: null },
          { id: 5, title: 'Suivi Paiements Impayés', type: 'Financier', generated_by: 'Robot Automatique', status: 'scheduled', created_at: '2026-03-15T08:00:00', file_url: null },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await apiClient.post('/reports/generate', { type: 'complete' });
      alert('🤖 Le Robot a lancé la génération du rapport ! Vous serez notifié quand il sera prêt.');
    } catch {
      alert('🤖 Rapport planifié par le Robot ! (Mode démo)');
    } finally {
      setGenerating(false);
    }
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    completed: { color: '#059669', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={14} />, label: 'Terminé' },
    processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <Clock size={14} />, label: 'En cours' },
    scheduled: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <Calendar size={14} />, label: 'Planifié' },
  };

  return (
    <div className="erp-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
            <FileText size={28} style={{ marginRight: 12, verticalAlign: 'middle' }} />
            Rapports & Robots
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
            Rapports générés automatiquement par les Robots OMI
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', opacity: generating ? 0.7 : 1 }}
        >
          {generating ? '🤖 Génération...' : '🤖 Générer un Rapport'}
        </button>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(99,102,241,0.08))',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        border: '1px solid rgba(139,92,246,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <span style={{ fontSize: '2rem' }}>🤖</span>
        <div>
          <p style={{ fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>Robots Automatiques Actifs</p>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            3 robots surveillent votre établissement : Alertes de paiement, Génération de bilans, Suivi de présence.
            Ils envoient des rapports PDF téléchargeables à intervalles réguliers.
          </p>
        </div>
      </div>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {['Tous', 'Financier', 'Académique', 'Présence', 'Analytique'].map(f => (
          <button key={f} style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: f === 'Tous' ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.1)',
            background: f === 'Tous' ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.8)',
            color: f === 'Tous' ? 'var(--color-primary)' : '#64748b',
            fontWeight: f === 'Tous' ? 600 : 400,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Rapport list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Chargement des rapports...</div>
        ) : (
          reports.map((report) => {
            const sc = statusConfig[report.status];
            return (
              <div key={report.id} style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: 16,
                padding: '20px 24px',
                border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ background: 'rgba(99,102,241,0.1)', padding: 12, borderRadius: 12, color: '#6366f1' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--color-text)' }}>{report.title}</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                      Par {report.generated_by} · {new Date(report.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ background: sc.bg, color: sc.color, padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {sc.icon} {sc.label}
                  </span>
                  {report.status === 'completed' && (
                    <button style={{ background: 'var(--gradient-primary)', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 500 }}>
                      <Download size={14} /> PDF
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
