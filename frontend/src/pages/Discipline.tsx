import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  Trophy, 
  AlertTriangle, 
  History,
  CheckCircle2,
  X
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

interface DisciplineRecord {
  id: number;
  category: 'merit' | 'demerit' | 'sanction';
  reason: string;
  description: string;
  points: number;
  sanction_type: string;
  incident_date: string;
  notified_parents: boolean;
  student: {
    user: {
      first_name: string;
      last_name: string;
    }
  };
}

export const DisciplinePage: React.FC = () => {
  const [records, setRecords] = useState<DisciplineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<{id: number, first_name: string, last_name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    student_id: '',
    category: 'demerit' as 'merit' | 'demerit' | 'sanction',
    reason: '',
    description: '',
    points: 0,
    sanction_type: '',
    incident_date: new Date().toISOString().split('T')[0],
    notify_parents: true
  });

  useEffect(() => {
    fetchRecords();
    fetchStudents();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/discipline');
      setRecords(res.data.data);
    } catch (err) {
      toast.error('Erreur chargement discipline');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiClient.get('/students');
      // res.data.data is usually the format for paginated results in Laravel
      setStudents(res.data.data || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading('Enregistrement...');
    try {
      await apiClient.post('/discipline', formData);
      toast.success('Discipline enregistrée !', { id: tid });
      setIsModalOpen(false);
      setFormData({
        student_id: '',
        category: 'demerit',
        reason: '',
        description: '',
        points: 0,
        sanction_type: '',
        incident_date: new Date().toISOString().split('T')[0],
        notify_parents: true
      });
      fetchRecords();
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement', { id: tid });
    }
  };

  const getCategoryTheme = (cat: string) => {
    switch(cat) {
      case 'merit': return { bg: '#ECFDF5', text: '#059669', icon: Trophy };
      case 'sanction': return { bg: '#FEF2F2', text: '#DC2626', icon: ShieldAlert };
      default: return { bg: '#FFFBEB', text: '#D97706', icon: AlertTriangle };
    }
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Suivi Disciplinaire</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gérez les mérites, les sanctions et l'engagement des parents.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary" 
          style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 24px', borderRadius: '12px' }}
        >
          <Plus size={20} /> Nouveau Signalement
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
         <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ padding: '12px', borderRadius: '12px', background: '#ECFDF5', color: '#10B981' }}><Trophy size={24}/></div>
               <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mérites Totaux</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>142</div>
               </div>
            </div>
         </div>
         <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ padding: '12px', borderRadius: '12px', background: '#FFFBEB', color: '#F59E0B' }}><AlertTriangle size={24}/></div>
               <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Avertissements</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>28</div>
               </div>
            </div>
         </div>
         <div className="glass-card" style={{ padding: '1.5rem', background: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ padding: '12px', borderRadius: '12px', background: '#FEF2F2', color: '#EF4444' }}><ShieldAlert size={24}/></div>
               <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sanctions Lourdes</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>5</div>
               </div>
            </div>
         </div>
      </div>

      <div className="glass-card" style={{ background: 'white', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
             <History size={20} /> Historique Disciplinaire
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input type="text" placeholder="Rechercher un élève..." className="input" style={{ width: '250px', paddingLeft: '36px' }} />
             </div>
             <button className="btn btn-secondary" style={{ padding: '10px' }}><Filter size={18}/></button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>
        ) : records.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucun enregistrement trouvé.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {records.map(r => {
              const theme = getCategoryTheme(r.category);
              const Icon = theme.icon;
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: theme.bg, color: theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Icon size={24} />
                      </div>
                      <div>
                         <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{r.student?.user?.first_name} {r.student?.user?.last_name}</div>
                         <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '4px' }}>
                            <span>Motif: <b style={{ color: '#1E293B' }}>{r.reason}</b></span>
                            <span>•</span>
                            <span>Date: {formatDate(r.incident_date)}</span>
                         </div>
                      </div>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      {r.notified_parents && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600, background: '#ECFDF5', padding: '4px 10px', borderRadius: '20px' }}>
                            <CheckCircle2 size={12} /> Parent Notifié
                         </div>
                      )}
                      <div style={{ textAlign: 'right' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Action</div>
                         <div style={{ fontSize: '0.9rem', fontWeight: 700, color: theme.text }}>{r.sanction_type || (r.points > 0 ? `+${r.points} pts` : r.points < 0 ? `${r.points} pts` : 'Note informative')}</div>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Record Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '600px', background: 'white', padding: 0 }}>
             <div style={{ padding: '1.5rem', background: 'var(--gradient-primary)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Nouveau Signalement Disciplinaire</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24}/></button>
             </div>
             
             <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                   <label className="label">Élève</label>
                   <select 
                     className="input" 
                     required
                     value={formData.student_id}
                     onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                   >
                      <option value="">Sélectionner un élève...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                   </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                   <div>
                      <label className="label">Catégorie</label>
                      <select 
                        className="input" 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                      >
                         <option value="merit">Mérite / Félicitation</option>
                         <option value="demerit">Avertissement</option>
                         <option value="sanction">Sanction Disciplinaire</option>
                      </select>
                   </div>
                   <div>
                      <label className="label">Date de l'incident</label>
                      <input 
                        type="date" 
                        className="input" 
                        value={formData.incident_date}
                        onChange={(e) => setFormData({...formData, incident_date: e.target.value})}
                      />
                   </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                   <label className="label">Motif (Court)</label>
                   <input 
                     type="text" 
                     className="input" 
                     placeholder="Ex: Retards répétitifs, Bagarre, Excellence..."
                     value={formData.reason}
                     onChange={(e) => setFormData({...formData, reason: e.target.value})}
                     required
                   />
                </div>

                {formData.category === 'sanction' && (
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="label">Type de Sanction</label>
                    <select 
                      className="input" 
                      value={formData.sanction_type}
                      onChange={(e) => setFormData({...formData, sanction_type: e.target.value})}
                    >
                       <option value="">Aucune sanction immédiate</option>
                       <option value="Heures de colle">Heures de colle</option>
                       <option value="Exclusion temporaire">Exclusion temporaire</option>
                       <option value="Blâme">Blâme officiel</option>
                       <option value="Avertissement écrit">Avertissement écrit</option>
                    </select>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                   <label className="label">Détails / Description</label>
                   <textarea 
                     className="input" 
                     rows={3} 
                     style={{ resize: 'none' }}
                     value={formData.description}
                     onChange={(e) => setFormData({...formData, description: e.target.value})}
                   />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: '#F8FAFC', borderRadius: '12px', marginBottom: '2rem' }}>
                   <input 
                     type="checkbox" 
                     id="notify" 
                     checked={formData.notify_parents}
                     onChange={(e) => setFormData({...formData, notify_parents: e.target.checked})}
                     style={{ width: '20px', height: '20px' }}
                   />
                   <label htmlFor="notify" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Avertir immédiatement les parents par SMS / Notification
                   </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                   <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Annuler</button>
                   <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Enregistrer le signalement</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
