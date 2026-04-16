import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar as CalendarIcon, 
  Plus, 
  PenTool,
  Clock
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

interface LessonLog {
  id: number;
  date: string;
  topic: string;
  description?: string;
  homework?: string;
  homework_due_date?: string;
  subject: { name: string; code: string };
  teacher: { user: { first_name: string; last_name: string } };
  class_id: number;
}

import { LessonLogModal } from '../components/LessonLogModal';

export const Pedagogy: React.FC = () => {
  const [logs, setLogs] = useState<LessonLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [classes, setClasses] = useState<{id: number, name: string}[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchLogs();
    }
  }, [selectedClass]);

  const fetchInitialData = async () => {
    try {
      const res = await apiClient.get('/classes');
      setClasses(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedClass(res.data.data[0].id.toString());
      }
    } catch (err) {
      toast.error('Erreur de chargement des classes');
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/lesson-logs?class_id=${selectedClass}`);
      // Pagination might return results in 'data' field or directly
      setLogs(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement du cahier de texte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--surface-900)' }}>Cahier de Texte</h1>
          <p style={{ color: 'var(--text-muted)' }}>Contrôlez l'avancement pédagogique et les devoirs</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select
            className="input"
            style={{ minWidth: '200px' }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Sélectionner une classe</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <Plus size={18} />
            Remplir le cahier
          </button>
        </div>
      </header>

      {!selectedClass ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
          <p>Veuillez sélectionner une classe pour consulter le cahier de texte.</p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}>Chargement pédagogique...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {logs.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <PenTool size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
              <p>Aucune leçon enregistrée pour cette classe pour le moment.</p>
            </div>
          ) : (
            logs.map(log => (
              <article
                key={log.id}
                className="glass-card"
                style={{
                  padding: '2rem',
                  borderLeft: '5px solid var(--primary)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        color: 'var(--primary)',
                        textTransform: 'uppercase'
                      }}>
                        {log.subject.name}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CalendarIcon size={14} /> {new Date(log.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                   </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--surface-900)' }}>
                  {log.topic}
                </h2>

                <p style={{ color: 'var(--surface-600)', lineHeight: '1.6', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                  {log.description || 'Synthèse de la leçon en attente...'}
                </p>

                {log.homework && (
                  <div style={{
                    background: '#FEFCE8',
                    border: '1px solid #FEF08A',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    marginTop: '1.5rem'
                  }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem', color: '#854D0E', marginBottom: '0.5rem' }}>
                        <Clock size={16} /> Travail à la maison
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#A16207', marginBottom: '0.5rem' }}>{log.homework}</p>
                    {log.homework_due_date && (
                      <div style={{ fontSize: '0.8rem', color: '#A16207', fontWeight: 600 }}>
                        ⏳ Échéance : {new Date(log.homework_due_date).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                )}

                <footer style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {log.teacher?.user?.first_name[0]}{log.teacher?.user?.last_name[0]}
                      </div>
                      <span style={{ fontWeight: 500 }}>{log.teacher?.user?.first_name} {log.teacher?.user?.last_name}</span>
                   </div>
                </footer>
              </article>
            ))
          )}
        </div>
      )}

      <LessonLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLogs}
      />
    </div>
  );
};
