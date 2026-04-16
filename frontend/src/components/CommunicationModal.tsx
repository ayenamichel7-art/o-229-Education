import React, { useState } from 'react';
import { X, Send, Users, User, LayoutGrid, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    type: 'announcement',
    channel: 'push',
    recipient_type: 'all',
    recipient_id: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    const toastId = toast.loading('Envoi du message...');

    try {
      await apiClient.post('/communications', {
        ...formData,
        recipient_id: formData.recipient_id ? parseInt(formData.recipient_id) : null
      });
      toast.success('Message envoyé avec succès !', { id: toastId });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Erreur lors de l\'envoi du message.', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '650px', background: 'white', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', background: 'var(--gradient-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <MessageSquare size={24} />
             <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Nouvelle Communication</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%', color: 'white' }}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
             <div className="form-group">
                <label className="label">Type de Message</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {[
                    { id: 'announcement', icon: Info, label: 'Annonce' },
                    { id: 'emergency', icon: AlertTriangle, label: 'Urgent' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({...formData, type: t.id})}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600,
                        border: formData.type === t.id ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                        background: formData.type === t.id ? 'rgba(59,130,246,0.05)' : 'white',
                        color: formData.type === t.id ? 'var(--color-primary)' : '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      <t.icon size={16} /> {t.label}
                    </button>
                  ))}
                </div>
             </div>

             <div className="form-group">
                <label className="label">Canal de Diffusion</label>
                <select 
                  className="input" 
                  value={formData.channel}
                  onChange={(e) => setFormData({...formData, channel: e.target.value})}
                  style={{ marginTop: '0.5rem' }}
                >
                  <option value="push">Notification App</option>
                  <option value="email">E-mail</option>
                  <option value="sms">SMS</option>
                  <option value="all">Tous les Canaux</option>
                </select>
             </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
             <label className="label">Destinataires</label>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                {[
                  { id: 'all', icon: Users, label: 'Toute l\'école' },
                  { id: 'class', icon: LayoutGrid, label: 'Par Classe' },
                  { id: 'student', icon: User, label: 'Individuel' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setFormData({...formData, recipient_type: r.id})}
                    style={{
                      padding: '12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600,
                      border: formData.recipient_type === r.id ? '2px solid var(--color-primary)' : '1px solid #E2E8F0',
                      background: formData.recipient_type === r.id ? 'rgba(59,130,246,0.05)' : 'white',
                      color: formData.recipient_type === r.id ? 'var(--color-primary)' : '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    <r.icon size={20} /> {r.label}
                  </button>
                ))}
             </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="label">Objet du Message</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ex: Information sur la rentrée scolaire"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="label">Contenu du Message</label>
            <textarea 
              className="input" 
              rows={5} 
              placeholder="Saisissez votre message ici..."
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
              style={{ resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Annuler</button>
            <button type="submit" disabled={isSending} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <Send size={18} />
              {isSending ? 'Envoi en cours...' : 'Diffuser le message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
