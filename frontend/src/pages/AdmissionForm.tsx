import React, { useEffect, useState } from 'react';

// import { apiClient } from '../api/apiClient';

interface FormField {
  id: number;
  name: string;
  label: string;
  type: string; // 'text', 'email', 'number', 'date', 'select', 'file', 'textarea'
  is_required: boolean;
  options: string[] | null; // For select fields
}

interface FormTemplate {
  id: number;
  title: string;
  description: string;
  fields: FormField[];
}

export const AdmissionForm: React.FC = () => {
  // const { tenant } = useTenant();
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form state structure: { [field_name]: value }
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    // In a real app, you might fetch a specific template by slug/ID.
    // Here we fetch the active "admission" form template for the tenant.
    const fetchTemplate = async () => {
      try {
        // Fallback mock data if API is not yet returning forms
        // const response = await apiClient.get('/forms/admission');
        // setTemplate(response.data.data);
        
        // Mocking the structure based on the database models we built
        setTemplate({
          id: 1,
          title: "Formulaire d'Admission",
          description: "Veuillez remplir ce formulaire pour soumettre la candidature de votre enfant.",
          fields: [
            { id: 1, name: 'first_name', label: 'Prénom de l\'élève', type: 'text', is_required: true, options: null },
            { id: 2, name: 'last_name', label: 'Nom de l\'élève', type: 'text', is_required: true, options: null },
            { id: 3, name: 'birth_date', label: 'Date de naissance', type: 'date', is_required: true, options: null },
            { id: 4, name: 'class_level', label: 'Niveau d\'entrée souhaité', type: 'select', is_required: true, options: ['6ème', '5ème', '4ème', '3ème'] },
            { id: 5, name: 'parent_email', label: 'Email du Parent', type: 'email', is_required: true, options: null },
            { id: 6, name: 'comments', label: 'Commentaires additionnels', type: 'textarea', is_required: false, options: null },
            // { id: 7, name: 'report_card', label: 'Dernier bulletin scolaire', type: 'file', is_required: true, options: null },
          ]
        });
      } catch (err) {
        setErrorMsg('Impossible de charger le formulaire.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle files differently
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: fileInput.files?.[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      /*
      // FormData is required for file uploads
      const payload = new FormData();
      payload.append('form_template_id', template!.id.toString());
      
      Object.keys(formData).forEach(key => {
        payload.append(`data[${key}]`, formData[key]);
      });

      await apiClient.post('/form-submissions', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      */
      
      // Simulating API latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMsg('Votre dossier a été soumis avec succès ! Nous vous contacterons sous peu.');
      setFormData({}); // Reset form
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Une erreur est survenue lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement du formulaire...</div>;
  if (!template) return <div style={{ padding: '4rem', textAlign: 'center', color: 'red' }}>Formulaire introuvable.</div>;

  return (
    <div style={{ padding: '4rem 2rem', background: 'var(--surface-50)', minHeight: 'calc(100vh - 200px)' }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', background: 'white' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{template.title}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{template.description}</p>
        </div>

        {successMsg && (
          <div style={{ padding: '1rem', background: '#D1FAE5', color: '#065F46', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid #A7F3D0' }}>
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '1rem', background: '#FEE2E2', color: '#991B1B', borderRadius: 'var(--radius-md)', marginBottom: '2rem', border: '1px solid #FECACA' }}>
            ❌ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {template.fields.map(field => (
            <div key={field.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--surface-800)' }}>
                {field.label} {field.is_required && <span style={{ color: 'red' }}>*</span>}
              </label>

              {/* Text / Name / Date / Email */}
              {['text', 'email', 'number', 'date', 'file'].includes(field.type) && (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  required={field.is_required}
                  onChange={handleChange}
                  value={field.type !== 'file' ? formData[field.name] || '' : undefined}
                  style={inputStyle}
                />
              )}

              {/* Select Dropdown */}
              {field.type === 'select' && (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.is_required}
                  onChange={handleChange}
                  value={formData[field.name] || ''}
                  style={inputStyle}
                >
                  <option value="" disabled>-- Sélectionnez --</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {/* Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.is_required}
                  onChange={handleChange}
                  value={formData[field.name] || ''}
                  style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                />
              )}
            </div>
          ))}

          <hr style={{ border: 'none', borderTop: '1px solid var(--surface-100)', marginTop: '1rem', marginBottom: '1rem' }} />

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting}
            style={{ padding: '1rem', fontSize: '1.1rem', opacity: isSubmitting ? 0.7 : 1, width: '100%' }}
          >
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
          </button>

        </form>

      </div>
    </div>
  );
};

// Reusable styling for form elements (in a real app, move to index.css)
const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1px solid #CBD5E1',
  fontFamily: 'var(--font-sans)',
  fontSize: '1rem',
  color: 'var(--surface-900)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  background: 'var(--surface-50)'
};
