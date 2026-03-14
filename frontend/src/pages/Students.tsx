import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, ChevronDown, Eye, Edit, Trash2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';

interface Student {
  id: number;
  matricule: string;
  first_name: string;
  last_name: string;
  email: string;
  grade: { name: string };
  status: string;
  created_at: string;
}

export const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/students', { params: { search } });
      setStudents(res.data.data || []);
    } catch {
      // Fallback mock data
      setStudents([
        { id: 1, matricule: 'STU-2026-001', first_name: 'Amara', last_name: 'Diallo', email: 'amara@ecole.com', grade: { name: '6ème' }, status: 'active', created_at: '2026-01-15' },
        { id: 2, matricule: 'STU-2026-002', first_name: 'Fatou', last_name: 'Koné', email: 'fatou@ecole.com', grade: { name: '5ème' }, status: 'active', created_at: '2026-01-20' },
        { id: 3, matricule: 'STU-2026-003', first_name: 'Moussa', last_name: 'Traoré', email: 'moussa@ecole.com', grade: { name: '4ème' }, status: 'active', created_at: '2026-02-01' },
        { id: 4, matricule: 'STU-2026-004', first_name: 'Awa', last_name: 'Camara', email: 'awa@ecole.com', grade: { name: '3ème' }, status: 'suspended', created_at: '2026-02-10' },
        { id: 5, matricule: 'STU-2026-005', first_name: 'Ibrahim', last_name: 'Sylla', email: 'ibrahim@ecole.com', grade: { name: 'Terminale' }, status: 'active', created_at: '2026-02-15' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.matricule}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="erp-page">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text)' }}>
            <Users size={28} style={{ marginRight: 12, verticalAlign: 'middle' }} />
            Gestion des Élèves
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginTop: 4 }}>{filtered.length} élèves enregistrés</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
          <Plus size={18} /> Nouvel Élève
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher par nom ou matricule..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.95rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}
          />
        </div>
        <button style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#475569' }}>
          Classe <ChevronDown size={16} />
        </button>
        <button style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#475569' }}>
          Statut <ChevronDown size={16} />
        </button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div className="loading-spinner" />
            <p>Chargement des données...</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                {['Matricule', 'Nom Complet', 'Email', 'Classe', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9rem' }}>{student.matricule}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{student.first_name} {student.last_name}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.9rem' }}>{student.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500 }}>
                      {student.grade.name}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: student.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: student.status === 'active' ? '#059669' : '#dc2626',
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500
                    }}>
                      {student.status === 'active' ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button title="Voir" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}><Eye size={18} /></button>
                      <button title="Modifier" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b' }}><Edit size={18} /></button>
                      <button title="Supprimer" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
