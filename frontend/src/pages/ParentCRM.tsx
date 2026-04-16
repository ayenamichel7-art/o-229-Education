import React, { useState, useEffect } from 'react';

import { Phone, Mail, Clock, MessageSquare, Plus, Search, UserCheck, AlertCircle } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

export const ParentCRM: React.FC = () => {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [filteredGuardians, setFilteredGuardians] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'call', interaction_date: new Date().toISOString().slice(0, 16), notes: '', status: 'completed'
  });

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/crm-parents');
      setGuardians(res.data.data);
      setFilteredGuardians(res.data.data);
    } catch (err) {
      toast.error('Erreur de chargement du CRM');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const term = search.toLowerCase();
    setFilteredGuardians(guardians.filter(g => 
      (g.guardian_name || '').toLowerCase().includes(term) ||
      (g.student_name || '').toLowerCase().includes(term) ||
      (g.guardian_phone || '').includes(term)
    ));
  }, [search, guardians]);

  const viewHistory = async (studentId: number) => {
    setSelectedStudentId(studentId);
    try {
      const res = await apiClient.get(`/crm-parents/${studentId}/interactions`);
      setInteractions(res.data.data);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Erreur lors du chargement de l\'historique');
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    try {
      await apiClient.post(`/crm-parents/${selectedStudentId}/interactions`, formData);
      toast.success('Interaction enregistrée avec succès');
      setFormData({ ...formData, notes: '' }); // Reset text but keep date/type
      // Refresh interactions
      const res = await apiClient.get(`/crm-parents/${selectedStudentId}/interactions`);
      setInteractions(res.data.data);
      // Refresh main list to update counters
      fetchGuardians();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout');
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={16} color="#3B82F6" />;
      case 'email': return <Mail size={16} color="#F59E0B" />;
      case 'meeting': return <UserCheck size={16} color="#10B981" />;
      case 'sms': return <MessageSquare size={16} color="#8B5CF6" />;
      default: return <AlertCircle size={16} color="#6B7280" />;
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--surface-900)', fontSize: '2rem', marginBottom: '0.25rem' }}>
            CRM Relation Parents
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Gérez l'historique de vos interactions avec les responsables légaux.
          </p>
        </div>
      </header>

      {/* Barre de Recherche */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', background: 'white' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom de parent, nom d'élève ou numéro..."
            className="form-input"
            style={{ paddingLeft: '3rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des Parents */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading && <p>Chargement des dossiers...</p>}
        {filteredGuardians.map((g) => (
          <div key={g.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white', position: 'relative' }}>
            
            {/* Statut pastille */}
            {g.interactions_count > 0 && (
              <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#DBEAFE', color: '#1E3A8A', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                {g.interactions_count} int.
              </span>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--surface-100)', color: 'var(--surface-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                {g.guardian_name ? g.guardian_name[0] : '?'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--surface-900)' }}>{g.guardian_name || 'Non Renseigné'}</h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{g.guardian_relationship || 'Responsable Légal'}</span>
              </div>
            </div>
            
            <div style={{ background: 'var(--surface-50)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--surface-800)', fontWeight: 500 }}>
                Enfant : <span style={{ color: 'var(--primary)' }}>{g.student_name}</span> ({g.class_name})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Phone size={14} /> {g.guardian_phone || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Mail size={14} /> {g.guardian_email || 'N/A'}
              </div>
              {g.last_interaction_date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  <Clock size={14} /> Dernier contact : {new Date(g.last_interaction_date).toLocaleDateString()}
                </div>
              )}
            </div>

            <button 
              onClick={() => viewHistory(g.id)}
              className="btn" 
              style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', padding: '0.6rem' }}
            >
              Ouvrir le Dossier CRM
            </button>
          </div>
        ))}
        {!loading && filteredGuardians.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>Aucun tuteur correspondant trouvé.</p>
        )}
      </div>

      {/* Modal / Sidebar d'historique CRM */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ width: '450px', background: 'white', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease-out' }}>
            
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Dossier CRM Parent</h2>
              <button className="btn" style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>

            {/* Formulaire Nouvel Événement */}
            <div style={{ padding: '1.5rem', background: 'var(--surface-50)' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--surface-800)' }}>Ajouter une interaction</h3>
              <form onSubmit={handleAddInteraction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <select required className="form-input" style={{ fontSize: '0.85rem', padding: '0.4rem' }} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="call">📞 Appel Tél.</option>
                      <option value="email">📧 Email</option>
                      <option value="sms">📱 SMS</option>
                      <option value="meeting">🤝 Rendez-vous</option>
                      <option value="other">ℹ️ Autre</option>
                    </select>
                  </div>
                  <div>
                    <input required type="datetime-local" className="form-input" style={{ fontSize: '0.85rem', padding: '0.4rem' }} value={formData.interaction_date} onChange={e => setFormData({...formData, interaction_date: e.target.value})} />
                  </div>
                </div>
                
                <textarea required className="form-input" rows={3} placeholder="Résumez la discussion pour vos collègues... (Crypté en base de données)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ fontSize: '0.85rem', resize: 'none' }}></textarea>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <select className="form-input" style={{ width: 'auto', fontSize: '0.85rem', padding: '0.4rem' }} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="completed">Terminé</option>
                    <option value="scheduled">Planifié / À faire</option>
                  </select>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Enregistrer
                  </button>
                </div>
              </form>
            </div>

            {/* Historique/Timeline */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--surface-800)', borderBottom: '1px solid var(--surface-200)', paddingBottom: '0.5rem', margin: 0 }}>Historique ({interactions.length})</h3>
              
              {interactions.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>Dossier vierge. Aucune interaction enregistrée.</p>}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                {interactions.map((interaction, index) => (
                  <div key={interaction.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                    {/* Ligne Timeline verticale */}
                    {index !== interactions.length - 1 && (
                      <div style={{ position: 'absolute', left: '15px', top: '30px', bottom: '-20px', width: '2px', background: 'var(--surface-200)' }}></div>
                    )}
                    
                    {/* Pastille Icône */}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'white', border: '2px solid var(--surface-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      {getIconForType(interaction.type)}
                    </div>

                    {/* Contenu */}
                    <div style={{ flex: 1, background: interaction.status === 'scheduled' ? '#FFFBEB' : 'white', border: interaction.status === 'scheduled' ? '1px solid #FDE68A' : '1px solid var(--surface-200)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--surface-800)' }}>
                          {interaction.staff?.first_name} {interaction.staff?.last_name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(interaction.interaction_date).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--surface-700)', lineHeight: 1.5 }}>
                        {interaction.notes}
                      </p>
                      {interaction.status === 'scheduled' && (
                        <div style={{ marginTop: '0.5rem', display: 'inline-block', background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          PRÉVU À VENIR
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
