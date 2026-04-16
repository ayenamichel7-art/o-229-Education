import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Type, 
  Hash, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  GripVertical, 
  Trash2, 
  Settings2,
  Plus,
  Save,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../../builder.css';

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
}

interface SortableFieldProps {
  field: FormField;
  isActive: boolean;
  onSelect: (field: FormField) => void;
  onDelete: (id: string) => void;
}

// Types de champs disponibles
const FIELD_TYPES = [
  { id: 'text', label: 'Texte Court', icon: <Type size={18} /> },
  { id: 'number', label: 'Nombre', icon: <Hash size={18} /> },
  { id: 'date', label: 'Date', icon: <Calendar size={18} /> },
  { id: 'select', label: 'Liste Déroulante', icon: <ChevronDown size={18} /> },
  { id: 'checkbox', label: 'Case à cocher', icon: <CheckCircle2 size={18} /> },
];

/**
 * Composant de champ individuel dans le canevas
 */
const SortableField: React.FC<SortableFieldProps> = ({ field, isActive, onSelect, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`canvas-block ${isActive ? 'canvas-block-active' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect(field); }}
    >
      <div className="block-actions">
        <button className="action-btn" {...attributes} {...listeners}>
          <GripVertical size={14} />
        </button>
        <button className="action-btn" onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}>
          <Trash2 size={14} color="#ef4444" />
        </button>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--surface-800)' }}>
          {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
        <div style={{ 
          background: '#f9fafb', 
          border: '1px solid #e5e7eb', 
          padding: '0.75rem', 
          borderRadius: 'var(--radius-md)',
          color: '#9ca3af',
          fontSize: '0.875rem'
        }}>
          {field.placeholder || 'Saisissez une réponse...'}
        </div>
      </div>
    </div>
  );
};

/**
 * Fluent Form Builder - Frontend Component
 */
const FormBuilder: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', type: 'text', label: 'Nom de l\'élève', placeholder: 'Saisissez le nom', required: true },
    { id: '2', type: 'date', label: 'Date de naissance', placeholder: '', required: true },
  ]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (typeData: any) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: typeData.id,
      label: typeData.label,
      placeholder: '',
      required: false
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  const handleSave = () => {
    const toastId = toast.loading('Sauvegarde du formulaire...');
    setTimeout(() => {
      toast.success('Formulaire sauvegardé avec succès !', { id: toastId });
    }, 1000);
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="glass-card" style={{ 
        padding: '1rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        margin: '1rem',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Constructeur de Formulaire</h2>
          <span style={{ background: '#e0e7ff', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
            Fluent Mode
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => toast('Prévisualisation non disponible', { icon: '👁️' })} className="btn" style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151' }}>
            <Eye size={18} /> Prévisualiser
          </button>
          <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
            <Save size={18} /> Sauvegarder
          </button>
        </div>
      </header>

      <div className="builder-layout">
        {/* Sidebar: Available Fields */}
        <aside className="builder-sidebar">
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '0.05em', fontWeight: 800 }}>
            Éléments du formulaire
          </h3>
          {FIELD_TYPES.map(type => (
            <div 
              key={type.id} 
              className="draggable-item"
              onClick={() => addField(type)}
            >
              <div style={{ background: '#f0f4ff', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
                {type.icon}
              </div>
              <span style={{ fontSize: '0.875rem' }}>{type.label}</span>
              <Plus size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />
            </div>
          ))}
        </aside>

        {/* Canvas: Drag and Drop Area */}
        <main className="builder-canvas">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={fields.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field) => (
                <SortableField 
                  key={field.id} 
                  field={field} 
                  isActive={selectedFieldId === field.id}
                  onSelect={(f) => setSelectedFieldId(f.id)}
                  onDelete={deleteField}
                />
              ))}
            </SortableContext>
            
            {/* Si vide */}
            {fields.length === 0 && (
              <div style={{ 
                border: '2px dashed #cbd5e1', 
                borderRadius: 'var(--radius-xl)', 
                padding: '4rem', 
                textAlign: 'center',
                color: '#64748b'
              }}>
                Glissez un champ ici pour commencer
              </div>
            )}
          </DndContext>
        </main>

        {/* Properties Panel */}
        <aside className="builder-properties">
          {selectedField ? (
            <div className="animate-fade-in">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', marginBottom: '1.5rem' }}>
                <Settings2 size={18} color="var(--primary)" /> Configuration
              </h3>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  Libellé du champ
                </label>
                <input 
                  type="text" 
                  value={selectedField.label}
                  onChange={(e) => setFields(fields.map(f => f.id === selectedFieldId ? {...f, label: e.target.value} : f))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                  Texte d'aide (Placeholder)
                </label>
                <input 
                  type="text" 
                  value={selectedField.placeholder}
                  onChange={(e) => setFields(fields.map(f => f.id === selectedFieldId ? {...f, placeholder: e.target.value} : f))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input 
                  type="checkbox" 
                  checked={selectedField.required}
                  onChange={(e) => setFields(fields.map(f => f.id === selectedFieldId ? {...f, required: e.target.checked} : f))}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '0.875rem' }}>Rendre ce champ obligatoire</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#94a3b8' }}>
              <Settings2 size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.875rem' }}>Sélectionnez un champ pour le modifier</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default FormBuilder;
