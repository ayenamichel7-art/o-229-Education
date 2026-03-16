import React, { useState, useEffect } from 'react';
import { Receipt, X } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { useStudentStore } from '../store/useStudentStore';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const { recordPayment } = useFinanceStore();
  
  // We need to fetch students so the user can select who is paying.
  const { students, fetchStudents } = useStudentStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && students.length === 0) {
      fetchStudents(''); // Fetch once
    }
  }, [isOpen, students.length, fetchStudents]);

  const [formData, setFormData] = useState({
    student_id: '',
    amount: '',
    type: 'tuition',
    payment_method: 'cash',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_id || !formData.amount) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Enregistrement du paiement...');
    
    try {
      await recordPayment({
        student_id: Number(formData.student_id),
        amount: Number(formData.amount),
        amount_paid: Number(formData.amount), // Supposing they pay full immediately in this simple flow
        type: formData.type,
        payment_method: formData.payment_method,
      });
      toast.success('Paiement enregistré avec succès.', { id: toastId });
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '450px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B', margin: 0 }}>
            Enregistrer un paiement
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#64748B',
            padding: '4px', borderRadius: '4px'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <form id="payment-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Student Dropdown */}
            <div>
               <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' }}>
                  Élève / Étudiant *
                </label>
                <select name="student_id" value={formData.student_id} onChange={handleChange} required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: 'white' }}>
                  <option value="" disabled>Sélectionner un élève...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.matricule})
                    </option>
                  ))}
                </select>
            </div>

            {/* Amount */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' }}>
                Montant Reçu (FCFA) *
              </label>
              <input required type="number" min="0" step="100" name="amount" value={formData.amount} onChange={handleChange} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }} 
                placeholder="Ex: 150000"
              />
            </div>

            {/* Payment specifics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' }}>
                  Type de frais
                </label>
                <select name="type" value={formData.type} onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: 'white' }}>
                  <option value="tuition">Scolarité</option>
                  <option value="registration">Inscription</option>
                  <option value="exam">Frais d'Examen</option>
                  <option value="transport">Transport</option>
                  <option value="uniform">Uniforme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.25rem' }}>
                  Moyen de paiement
                </label>
                <select name="payment_method" value={formData.payment_method} onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', background: 'white' }}>
                  <option value="cash">Espèces</option>
                  <option value="bank_transfer">Virement Bancaire</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Carte Bancaire</option>
                </select>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid #E2E8F0',
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
          backgroundColor: '#F8FAFC',
          borderRadius: '0 0 16px 16px'
        }}>
          <button type="button" onClick={onClose} disabled={isSubmitting} style={{
            padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #CBD5E1',
            background: 'white', color: '#475569', fontWeight: 500, cursor: 'pointer'
          }}>
            Annuler
          </button>
          <button type="submit" form="payment-form" disabled={isSubmitting} style={{
            padding: '0.6rem 1.25rem', borderRadius: '8px', border: 'none',
            background: 'var(--gradient-primary)', color: 'white', fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1
          }}>
            <Receipt size={18} />
            {isSubmitting ? 'Traitement...' : 'Encaisser'}
          </button>
        </div>

      </div>
    </div>
  );
};
