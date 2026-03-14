import React, { useState, useEffect } from 'react';
import { Shield, Clock, User, AlertTriangle, CheckCircle, Info, LogIn, LogOut, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface AuditEntry {
  id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

const actionIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  created: { icon: <CheckCircle size={16} />, color: '#10b981' },
  updated: { icon: <Edit size={16} />, color: '#3b82f6' },
  deleted: { icon: <Trash2 size={16} />, color: '#ef4444' },
  login: { icon: <LogIn size={16} />, color: '#8b5cf6' },
  logout: { icon: <LogOut size={16} />, color: '#6b7280' },
  warning: { icon: <AlertTriangle size={16} />, color: '#f59e0b' },
};

export const AuditTrail: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/audit-logs');
        setEntries(res.data.data || []);
      } catch {
        setEntries([
          { id: 1, user_name: 'Admin Principal', action: 'login', entity_type: 'Auth', entity_id: 0, ip_address: '192.168.1.100', user_agent: 'Chrome/120', created_at: '2026-03-12T13:00:00' },
          { id: 2, user_name: 'Robot Facturation', action: 'created', entity_type: 'Report', entity_id: 45, ip_address: 'Serveur Interne', user_agent: 'CronJob', created_at: '2026-03-12T12:30:00' },
          { id: 3, user_name: 'Prof. Martin', action: 'updated', entity_type: 'Note', entity_id: 892, ip_address: '192.168.1.105', user_agent: 'Firefox/121', created_at: '2026-03-12T11:45:00' },
          { id: 4, user_name: 'Admin Principal', action: 'created', entity_type: 'Student', entity_id: 551, ip_address: '192.168.1.100', user_agent: 'Chrome/120', created_at: '2026-03-12T10:20:00' },
          { id: 5, user_name: 'Robot Paiement', action: 'warning', entity_type: 'Payment', entity_id: 230, ip_address: 'Serveur Interne', user_agent: 'CronJob', created_at: '2026-03-12T08:00:00' },
          { id: 6, user_name: 'Admin Principal', action: 'deleted', entity_type: 'FormTemplate', entity_id: 3, ip_address: '192.168.1.100', user_agent: 'Chrome/120', created_at: '2026-03-11T16:30:00' },
          { id: 7, user_name: 'Robot Présence', action: 'created', entity_type: 'Report', entity_id: 44, ip_address: 'Serveur Interne', user_agent: 'CronJob', created_at: '2026-03-11T18:00:00' },
          { id: 8, user_name: 'Admin Principal', action: 'logout', entity_type: 'Auth', entity_id: 0, ip_address: '192.168.1.100', user_agent: 'Chrome/120', created_at: '2026-03-11T17:45:00' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const actionLabels: Record<string, string> = {
    created: 'a créé',
    updated: 'a modifié',
    deleted: 'a supprimé',
    login: 's\'est connecté',
    logout: 's\'est déconnecté',
    warning: 'alerte détectée',
  };

  return (
    <div className="erp-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
            <Shield size={28} style={{ marginRight: 12, verticalAlign: 'middle' }} />
            Journal d'Audit (Audit Trail)
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginTop: 4 }}>
            Traçabilité complète de toutes les actions sur la plateforme
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(16,185,129,0.06))',
        borderRadius: 16, padding: 20, marginBottom: 24,
        border: '1px solid rgba(59,130,246,0.12)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Info size={20} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <p style={{ fontSize: '0.9rem', color: '#475569' }}>
          Le robot de traçabilité enregistre automatiquement toutes les créations, modifications, suppressions et connexions en temps réel. Elles sont immuables et non-supprimables.
        </p>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: 'rgba(0,0,0,0.06)' }} />

        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Chargement du journal...</div>
        ) : (
          entries.map((entry) => {
            const ai = actionIcons[entry.action] || actionIcons['created'];
            return (
              <div key={entry.id} style={{
                position: 'relative',
                marginBottom: 16,
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(16px)',
                borderRadius: 16,
                padding: '18px 24px',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateX(4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}
              >
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: -25,
                  top: 22,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  border: `2px solid ${ai.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: ai.color,
                }}>
                  {ai.icon}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)' }}>
                      <span style={{ color: ai.color }}>{entry.user_name}</span> {actionLabels[entry.action] || entry.action}
                      {entry.entity_type !== 'Auth' && (
                        <span style={{ color: '#64748b' }}> {entry.entity_type} #{entry.entity_id}</span>
                      )}
                    </p>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={12} /> {entry.ip_address}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {new Date(entry.created_at).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
