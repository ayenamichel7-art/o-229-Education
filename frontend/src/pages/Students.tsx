import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, ChevronDown, Edit, Trash2, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStudentStore, Student } from '../store/useStudentStore';
import { useAuth } from '../store/useAuth';
import { StudentModal } from '../components/StudentModal';
import { BulletinModal } from '../components/BulletinModal';
import toast from 'react-hot-toast';

export const Students: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { students, isLoading, fetchStudents, deleteStudent } = useStudentStore();
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [bulletinStudent, setBulletinStudent] = useState<{id: number, name: string} | null>(null);

  // Check if user has admin/management roles to show action buttons
  const isManager = user?.roles?.some(r => ['super-admin', 'admin-school', 'director'].includes(r));

  useEffect(() => {
    fetchStudents(search).catch(() => {
      // Ignore errors handled by store
    });
  }, [search, fetchStudents]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('common.confirm_delete') || 'Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      const loadingToast = toast.loading(t('common.loading') || 'Suppression en cours...');
      try {
        await deleteStudent(id);
        toast.success('Élève supprimé avec succès', { id: loadingToast });
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Erreur lors de la suppression', { id: loadingToast });
      }
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
            {t('students.title')}
          </h1>
          <p style={{ color: 'var(--color-text-light)', marginTop: 4 }}>{t('students.registered_count', { count: filtered.length })}</p>
        </div>
        {isManager && (
          <button 
            onClick={() => {
              setEditingStudent(null);
              setIsModalOpen(true);
            }}
            className="btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
          >
            <Plus size={18} /> {t('students.new_student')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={t('students.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', fontSize: '0.95rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}
          />
        </div>
        <button style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#475569' }}>
          {t('students.grade')} <ChevronDown size={16} />
        </button>
        <button style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: '#475569' }}>
          {t('common.status')} <ChevronDown size={16} />
        </button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
        {isLoading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
            <div className="loading-spinner" />
            <p>{t('students.loading_data')}</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.06)' }}>
                {[t('students.matricule'), t('students.full_name'), t('common.email'), t('students.grade'), t('common.status'), t('common.actions')].map(h => (
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
                      {student.grade?.name || 'Non assigné'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: student.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: student.status === 'active' ? '#059669' : '#dc2626',
                      padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500
                    }}>
                      {student.status === 'active' ? t('common.active') : t('common.suspended')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                         onClick={() => setBulletinStudent({ id: student.id, name: `${student.first_name} ${student.last_name}` })}
                         title="Bulletin" 
                         style={{ background: 'rgba(59,130,246,0.1)', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                         <FileText size={16} /> Bulletin
                      </button>
                      {isManager && (
                        <>
                          <button 
                            onClick={() => { setEditingStudent(student); setIsModalOpen(true); }}
                            title={t('common.edit')} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f59e0b', padding: '6px' }}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id)}
                            title={t('common.delete')} 
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '6px' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <StudentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        student={editingStudent} 
      />

      <BulletinModal
        isOpen={!!bulletinStudent}
        onClose={() => setBulletinStudent(null)}
        studentId={bulletinStudent?.id || 0}
        studentName={bulletinStudent?.name || ''}
      />
    </div>
  );
};
