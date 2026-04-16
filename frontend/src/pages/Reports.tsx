import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Clock, CheckCircle } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

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
  const { t, i18n } = useTranslation();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterType, setFilterType] = useState('Tous');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/reports');
        setReports(res.data.data || []);
      } catch (err: any) {
        toast.error('Erreur lors du chargement des rapports');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerateReport = async () => {
    setGenerating(true);
    const toastId = toast.loading('Demande de génération envoyée au robot...');
    try {
      // By default generate a financial one if no spec provided, or academic.
      await apiClient.post('/reports/generate', { type: 'academic' });
      toast.success(t('reports_page.robot_alert'), { id: toastId });
      // Reload reports after a short delay to fetch new pending status
      setTimeout(() => {
        apiClient.get('/reports').then(res => setReports(res.data.data || []));
      }, 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la génération', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    completed: { color: '#059669', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={14} />, label: t('common.completed') },
    processing: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <Clock size={14} />, label: t('common.processing') },
    scheduled: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <Calendar size={14} />, label: t('common.scheduled') },
  };

  return (
    <div className="erp-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
            <FileText size={28} style={{ marginRight: 12, verticalAlign: 'middle' }} />
            {t('reports_page.title')}
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
            {t('reports_page.subtitle')}
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', opacity: generating ? 0.7 : 1 }}
        >
          {generating ? t('reports_page.generating') : t('reports_page.generate_btn')}
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
          <p style={{ fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>{t('reports_page.robots_active')}</p>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {t('reports_page.robots_desc')}
          </p>
        </div>
      </div>

      {/* Academic Bulletins Section */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'white', borderLeft: '4px solid #10B981' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.5rem' }}>Extraction des Bulletins Académiques</h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Générez les relevés de notes officiels pour toute une classe ou pour un élève spécifique.</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => toast('Fonctionnalité d\'extraction groupée bientôt disponible !')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#10B981' }}
          >
            <Download size={18} />
            Extraction Groupée (PDF)
          </button>
        </div>
      </div>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { key: 'Tous', label: t('reports_page.filter_all') },
          { key: 'Financier', label: t('reports_page.filter_financial') },
          { key: 'Académique', label: t('reports_page.filter_academic') },
          { key: 'Présence', label: t('reports_page.filter_attendance') },
          { key: 'Analytique', label: t('reports_page.filter_analytic') }
        ].map(f => (
          <button 
            key={f.key} 
            onClick={() => setFilterType(f.key)}
            style={{
            padding: '8px 20px',
            borderRadius: 20,
            border: filterType === f.key ? '2px solid var(--color-primary)' : '1px solid rgba(0,0,0,0.1)',
            background: filterType === f.key ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.8)',
            color: filterType === f.key ? 'var(--color-primary)' : '#64748b',
            fontWeight: filterType === f.key ? 600 : 400,
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Rapport list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>{t('reports_page.loading_reports')}</div>
        ) : (
          reports.filter(r => filterType === 'Tous' ||
            (filterType === 'Financier' && r.type === 'financial') ||
            (filterType === 'Académique' && r.type === 'academic') ||
            (filterType === 'Présence' && r.type === 'attendance') ||
            (filterType === 'Analytique' && r.type === 'analytical')
          ).map((report) => {
            const sc = statusConfig[report.status] || statusConfig['processing'];
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
                      Par {report.generated_by} · {new Date(report.created_at).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ background: sc.bg, color: sc.color, padding: '4px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {sc.icon} {sc.label}
                  </span>
                  {report.status === 'completed' && report.file_url ? (
                    <a href={report.file_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', background: 'var(--gradient-primary)', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 500 }}>
                      <Download size={14} /> Télécharger
                    </a>
                  ) : report.status === 'completed' && !report.file_url ? (
                   <button onClick={() => toast.error('Ce fichier n\'est plus disponible')} style={{ background: '#cbd5e1', border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 500 }}>
                      <FileText size={14} /> Non Disponible
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
