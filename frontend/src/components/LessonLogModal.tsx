import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

interface LessonLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LessonLogModal: React.FC<LessonLogModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    date: new Date().toISOString().split('T')[0],
    topic: '',
    description: '',
    homework: '',
    homework_due_date: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
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
      
      if (classRes.data.data.length > 0) setFormData(prev => ({ ...prev, class_id: classRes.data.data[0].id.toString() }));
    } catch (err) {
      toast.error('Erreur de chargement des ressources pédagogiques');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.class_id || !formData.subject_id || !formData.teacher_id || !formData.topic) {
        toast.error('Veuillez remplir les champs obligatoires.');
        return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/lesson-logs', formData);
      toast.success('Leçon enregistrée dans le cahier de texte !');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '600px', background: 'white', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--surface-900)' }}>Ajouter une leçon (Cahier de texte)</h2>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Classe</label>
                <select className="input" required value={formData.class_id} onChange={e => setFormData({...formData, class_id: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Matière</label>
                <select className="input" required value={formData.subject_id} onChange={e => setFormData({...formData, subject_id: e.target.value})}>
                    <option value="">Sélectionner...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Professeur</label>
            <select className="input" required value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})}>
                <option value="">Sélectionner un professeur...</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Date du cours</label>
                <input type="date" className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Titre de la leçon / Chapitre</label>
                <input className="input" placeholder="Ex: Les nombres décimaux" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} required />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.875rem', fontWeight: 600 }}>Déroulement de la séance</label>
            <textarea className="input" style={{ minHeight: '100px' }} placeholder="Résumé du cours effectué..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '12px', border: '1px solid #FEF3C7' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#92400E', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} /> Travail à faire (Devoirs)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea className="input" style={{ background: 'white' }} placeholder="Exercices à préparer..." value={formData.homework} onChange={e => setFormData({...formData, homework: e.target.value})} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date de remise :</span>
                    <input type="date" className="input" style={{ background: 'white', maxWidth: '180px' }} value={formData.homework_due_date} onChange={e => setFormData({...formData, homework_due_date: e.target.value})} />
                </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1 }}>Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={18} />
              {isSubmitting ? 'Enregistrement...' : 'Valider la leçon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
