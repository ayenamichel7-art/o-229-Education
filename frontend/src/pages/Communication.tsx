import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Filter, Mail, Phone, Bell, History, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { CommunicationModal } from '../components/CommunicationModal';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface CommunicationRecord {
  id: number;
  subject: string;
  content: string;
  type: string;
  channel: string;
  recipient_type: string;
  sent_at: string;
  sender: {
    first_name: string;
    last_name: string;
  };
  metadata: {
    recipient_count?: number;
  } | null;
}

export const Communication: React.FC = () => {
  const [records, setRecords] = useState<CommunicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/communications');
      setRecords(response.data.data);
    } catch (err) {
      console.error('Failed to fetch communications', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail size={16} />;
      case 'sms': return <Phone size={16} />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="erp-page">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1E293B' }}>Communication Parents</h1>
          <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Diffusez des informations et engagez-vous avec la communauté scolaire.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
        >
          <Send size={18} /> Nouveau Message
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: 'E-mails envoyés', count: '1,284', icon: Mail, color: '#3B82F6' },
          { label: 'SMS consommés', count: '856', icon: Phone, color: '#10B981' },
          { label: 'Notifications Push', count: '4,520', icon: Bell, color: '#F59E0B' }
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'white' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={28} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>{stat.count}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
           <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0, fontWeight: 700 }}>
             <History size={20} style={{ color: '#64748B' }} />
             Historique des Diffusions
           </h3>
           <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="text" placeholder="Rechercher..." style={{ padding: '10px 12px 10px 36px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: '0.85rem', width: 220 }} />
              </div>
              <button style={{ padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}><Filter size={18} /></button>
           </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><div className="loading-spinner"></div></div>
        ) : records.length === 0 ? (
          <div style={{ padding: '5rem', textAlign: 'center', color: '#64748B' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Aucun message envoyé pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {records.map((record) => (
              <div 
                key={record.id} 
                className="hover-card" 
                style={{ padding: '1.25rem', borderRadius: 16, border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#3B82F6')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#F1F5F9')}
              >
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: record.type === 'emergency' ? '#FEE2E2' : '#EFF6FF', color: record.type === 'emergency' ? '#EF4444' : '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getChannelIcon(record.channel)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>{record.subject}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                       <span>Destinataires: <b style={{ color: '#1E293B' }}>{record.metadata?.recipient_count || 0}</b></span>
                       <span>•</span>
                       <span>Date: {formatDate(record.sent_at)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Envoyé par</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>{record.sender.first_name} {record.sender.last_name}</div>
                   </div>
                   <ArrowRight size={20} style={{ color: '#CBD5E1' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CommunicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchHistory}
      />
    </div>
  );
};
