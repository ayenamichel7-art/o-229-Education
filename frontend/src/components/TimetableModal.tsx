import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

interface TimetableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classId: string;
}

export const TimetableModal: React.FC<TimetableModalProps> = ({ isOpen, onClose, onSuccess, classId }) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject_id: '',
    teacher_id: '',
    day_of_week: 'monday',
    start_time: '08:00',
    end_time: '10:00',
    room: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [subRes, teachRes] = await Promise.all([
        apiClient.get('/subjects'),
        apiClient.get('/teachers')
      ]);
      setSubjects(subRes.data.data);
      setTeachers(teachRes.data.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des données');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/timetable', {
        ...formData,
        class_id: classId
      });
      toast.success('Plage horaire ajoutée');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '500px', background: 'white', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Ajouter un cours</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Matière</label>
            <select 
              className="input" 
              required 
              value={formData.subject_id}
              onChange={e => setFormData({...formData, subject_id: e.target.value})}
            >
              <option value="">Sélectionner une matière...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Professeur</label>
            <select 
              className="input" 
              required 
              value={formData.teacher_id}
              onChange={e => setFormData({...formData, teacher_id: e.target.value})}
            >
              <option value="">Sélectionner un professeur...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.user.first_name} {t.user.last_name}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Jour</label>
              <select 
                className="input" 
                value={formData.day_of_week}
                onChange={e => setFormData({...formData, day_of_week: e.target.value})}
              >
                <option value="monday">Lundi</option>
                <option value="tuesday">Mardi</option>
                <option value="wednesday">Mercredi</option>
                <option value="thursday">Jeudi</option>
                <option value="friday">Vendredi</option>
                <option value="saturday">Samedi</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Salle</label>
              <input 
                className="input" 
                placeholder="Ex: Salle 102"
                value={formData.room}
                onChange={e => setFormData({...formData, room: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Début</label>
              <input 
                type="time" 
                className="input" 
                required 
                value={formData.start_time}
                onChange={e => setFormData({...formData, start_time: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>Fin</label>
              <input 
                type="time" 
                className="input" 
                required 
                value={formData.end_time}
                onChange={e => setFormData({...formData, end_time: e.target.value})}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: 'var(--surface-100)' }}>Annuler</button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Save size={18} />
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
