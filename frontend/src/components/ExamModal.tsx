import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExamModal: React.FC<ExamModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'test',
    date: new Date().toISOString().split('T')[0],
    class_id: '',
    subject_id: '',
    teacher_id: '',
    academic_year_id: '1', // Mock for now or fetch
    term: 1,
    max_score: 20,
    weight: 1,
    description: ''
  });

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [classRes, subRes, teachRes] = await Promise.all([
        apiClient.get('/classes'),
        apiClient.get('/subjects'),
        apiClient.get('/teachers')
      ]);
      setClasses(classRes.data.data);
      setSubjects(subRes.data.data);
      setTeachers(teachRes.data.data);
    } catch (err) {
      toast.error('Erreur de chargement des ressources');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/exams', formData);
      toast.success('Évaluation planifiée avec succès !');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur de création');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}>
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '650px', background: 'white', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div>
             <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1E293B', fontWeight: 700 }}>Programmer une évaluation</h2>
             <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>Configurez les paramètres de la nouvelle note</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#64748B' }}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Titre de l'évaluation</label>
            <input 
              className="input" 
              placeholder="Ex: Devoir de Mathématiques N°1" 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ fontSize: '1.1rem', padding: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
             <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Type</label>
                <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="test">Interrogation / Test</option>
                    <option value="exam">Composition / Examen</option>
                    <option value="quiz">Quiz Rapide</option>
                    <option value="homework">Devoir Maison</option>
                </select>
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Trimestre</label>
                <select className="input" value={formData.term} onChange={e => setFormData({...formData, term: parseInt(e.target.value)})}>
                    <option value={1}>1er Trimestre</option>
                    <option value={2}>2ème Trimestre</option>
                    <option value={3}>3ème Trimestre</option>
                </select>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Classe concernée</label>
                <select className="input" required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})}>
                    <option value="">Sélectionner une classe</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Matière</label>
                <select className="input" required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})}>
                    <option value="">Sélectionner une matière</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Enseignant</label>
                <select className="input" required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})}>
                    <option value="">-- Responsable --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Date prévue</label>
                <input type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Note Maximale</label>
                <div style={{ position: 'relative' }}>
                    <input type="number" className="input" value={formData.max_score} onChange={e => setFormData({...formData, max_score: parseFloat(e.target.value)})} />
                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94A3B8' }}>/ 20</span>
                </div>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Coefficient (Poids)</label>
                <input type="number" step="0.5" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, padding: '1rem' }}>Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 2, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem' }}>
              <Save size={20} />
              {isSubmitting ? 'Planification...' : 'Confirmer la programmation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
