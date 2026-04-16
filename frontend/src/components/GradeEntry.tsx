import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

interface GradeEntryProps {
  examId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const GradeEntry: React.FC<GradeEntryProps> = ({ examId, onClose, onSuccess }) => {
  const [exam, setExam] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<Record<number, { score: string, comment: string }>>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      const res = await apiClient.get(`/exams/${examId}`);
      const examData = res.data.data;
      setExam(examData);
      
      // Fetch students for this class
      const studentRes = await apiClient.get(`/students?class_id=${examData.class_id}`);
      setStudents(studentRes.data.data);

      // Map existing results if any
      const existingResults: Record<number, any> = {};
      examData.grades.forEach((g: any) => {
        existingResults[g.student_id] = { score: g.score.toString(), comment: g.comment || '' };
      });
      setResults(existingResults);
    } catch (err) {
      toast.error('Erreur lors du chargement des élèves');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (studentId: number, score: string) => {
    setResults(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], score }
    }));
  };

  const handleCommentChange = (studentId: number, comment: string) => {
    setResults(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], comment }
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = Object.entries(results).map(([studentId, data]) => ({
        student_id: parseInt(studentId),
        score: parseFloat(data.score) || 0,
        comment: data.comment
      }));

      await apiClient.post(`/exams/${examId}/results`, { results: payload });
      toast.success('Notes enregistrées avec succès !');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement de l'évaluation...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <button onClick={onClose} className="btn" style={{ padding: '8px', borderRadius: '50%', background: '#F1F5F9' }}>
              <ArrowLeft size={18} />
           </button>
           <div>
             <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Saisie des notes : {exam.name}</h2>
             <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{exam.school_class.name} — {exam.subject.name} (Max: {exam.max_score})</p>
           </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button onClick={onClose} className="btn" disabled={isSubmitting}>Annuler</button>
           <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} />
              {isSubmitting ? 'Sauvegarde...' : 'Enregistrer les notes'}
           </button>
        </div>
      </header>

      <div className="glass-card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
              <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.85rem' }}>ÉLÈVE</th>
              <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.85rem', width: '150px' }}>NOTE ({exam.max_score})</th>
              <th style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.85rem' }}>COMMENTAIRE / OBSERVATION</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                        {student.user.first_name[0]}{student.user.last_name[0]}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#1E293B' }}>{student.user.first_name} {student.user.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Matricule: {student.matricule}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <input 
                    type="number" 
                    step="0.25"
                    min="0"
                    max={exam.max_score}
                    placeholder="0.00"
                    className="input" 
                    style={{ fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', borderColor: parseFloat(results[student.id]?.score) < 10 ? '#FDA4AF' : '#E2E8F0' }}
                    value={results[student.id]?.score || ''}
                    onChange={(e) => handleScoreChange(student.id, e.target.value)}
                  />
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                   <input 
                    className="input" 
                    placeholder="Ex: Excellent travail, à encourager" 
                    value={results[student.id]?.comment || ''}
                    onChange={(e) => handleCommentChange(student.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
         <button onClick={handleSubmit} disabled={isSubmitting} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}>
            Valider et Enregistrer le relevé
         </button>
      </div>
    </div>
  );
};
