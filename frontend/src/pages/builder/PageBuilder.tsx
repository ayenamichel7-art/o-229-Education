import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
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
  Layout, 
  Image as ImageIcon, 
  AlignLeft, 
  MousePointer2,
  Trash2,
  Plus,
  Save,
  Globe,
  GripHorizontal,
  Smartphone,
  QrCode
} from 'lucide-react';
import '../../builder.css';

interface BlockData {
  title?: string;
  subtitle?: string;
  body?: string;
  text?: string;
}

interface Block {
  id: string;
  type: string;
  data: BlockData;
}

interface SortableBlockProps {
  block: Block;
  isActive: boolean;
  onSelect: (block: Block) => void;
  onDelete: (id: string) => void;
}

const BLOCK_TEMPLATES = [
  { id: 'hero', label: 'Bannière Héro', icon: <Layout size={18} />, color: '#4f46e5' },
  { id: 'text', label: 'Section Texte', icon: <AlignLeft size={18} />, color: '#0891b2' },
  { id: 'gallery', label: 'Galerie Photos', icon: <ImageIcon size={18} />, color: '#db2777' },
  { id: 'cta', label: 'Appel à l\'action', icon: <MousePointer2 size={18} />, color: '#ca8a04' },
  { id: 'mobile_promo', label: 'Promo App Mobile', icon: <Smartphone size={18} />, color: '#10b981' },
];

const SortableBlock: React.FC<SortableBlockProps> = ({ block, isActive, onSelect, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderPreview = () => {
    switch(block.type) {
      case 'hero':
        return (
          <div style={{ background: '#1e293b', color: 'white', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'white' }}>{block.data.title || 'Titre Principal'}</h2>
            <p style={{ opacity: 0.7 }}>{block.data.subtitle || 'Sous-titre accrocheur'}</p>
          </div>
        );
      case 'text':
        return (
          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{block.data.title || 'Titre de Section'}</h3>
            <p style={{ color: '#64748b' }}>{block.data.body || 'Contenu textuel dela section...'}</p>
          </div>
        );
      case 'cta':
        return (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{block.data.text || 'Prêt à commencer ?'}</span>
            <button className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}>Inscrivez-vous</button>
          </div>
        );
      case 'mobile_promo':
        return (
          <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '2.5rem', borderRadius: '12px', display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <QrCode size={60} color="#1e293b" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'white', margin: 0 }}>Notre Application Mobile</h3>
              <p style={{ opacity: 0.7, fontSize: '0.9rem', margin: '0.5rem 0 1rem' }}>Téléchargez notre app pour suivre les notes et devoirs.</p>
              <button className="btn btn-primary" style={{ background: 'white', color: '#1e293b', border: 'none', fontSize: '0.8rem' }}>
                Télécharger l'APK
              </button>
            </div>
            <Smartphone size={80} style={{ opacity: 0.1 }} />
          </div>
        );
      default:
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aperçu du bloc {block.type}</div>;
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`canvas-block ${isActive ? 'canvas-block-active' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect(block); }}
    >
      <div className="block-actions" style={{ top: '-15px', right: '15px' }}>
        <div className="action-btn" {...attributes} {...listeners} style={{ cursor: 'grab' }}>
          <GripHorizontal size={14} />
        </div>
        <button className="action-btn" onClick={() => onDelete(block.id)}>
          <Trash2 size={14} color="#ef4444" />
        </button>
      </div>

      <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', opacity: 0.2 }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', transform: 'rotate(-90deg)', display: 'block' }}>
          {block.type}
        </span>
      </div>

      {renderPreview()}
    </div>
  );
};

const PageBuilder: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'b1', type: 'hero', data: { title: 'Lycée Excellence', subtitle: 'L\'éducation de demain, aujourd\'hui.' } },
    { id: 'b2', type: 'text', data: { title: 'Notre Vision', body: 'Nous croyons en un apprentissage personnalisé...' } },
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (template: any) => {
    const newBlock: Block = {
      id: `block_${Date.now()}`,
      type: template.id,
      data: template.id === 'hero' ? { title: '', subtitle: '' } : { title: '', body: '' }
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
      {/* Dynamic Header */}
      <header style={{ 
        background: 'white', 
        padding: '0.75rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '10px' }}>
            <Globe size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Constructeur de Site Vitrine</h2>
            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Modification de : page-accueil</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" style={{ height: '40px', fontSize: '0.875rem' }}>
            <Save size={16} /> Publier les modifications
          </button>
        </div>
      </header>

      <div className="builder-layout">
        {/* Templates Panel */}
        <aside className="builder-sidebar" style={{ background: '#f8fafc' }}>
          <div style={{ padding: '0.5rem 0' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
              Bibliothèque de Blocs
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {BLOCK_TEMPLATES.map(t => (
                <div 
                  key={t.id} 
                  className="draggable-item" 
                  onClick={() => addBlock(t)}
                  style={{ 
                    flexDirection: 'column', 
                    height: '100px', 
                    justifyContent: 'center', 
                    padding: '0.5rem',
                    textAlign: 'center',
                    margin: 0
                  }}
                >
                  <div style={{ color: t.color, marginBottom: '0.5rem' }}>{t.icon}</div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Live Canvas */}
        <main className="builder-canvas">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '5rem' }}>
                {blocks.map(block => (
                  <SortableBlock 
                    key={block.id} 
                    block={block} 
                    isActive={selectedBlockId === block.id}
                    onSelect={(b) => setSelectedBlockId(b.id)}
                    onDelete={deleteBlock}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          <button className="btn" style={{ border: '2px dashed #cbd5e1', color: '#94a3b8', background: 'transparent', width: '100%', maxWidth: '800px', height: '100px' }} onClick={() => addBlock(BLOCK_TEMPLATES[0])}>
            <Plus size={24} /> Ajouter une nouvelle section
          </button>
        </main>

        {/* Editor Panel */}
        <aside className="builder-properties">
          {selectedBlock ? (
            <div className="animate-fade-in">
              <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                 <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px' }}>
                    {BLOCK_TEMPLATES.find(t => t.id === selectedBlock.type)?.icon}
                 </div>
                 <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Type de bloc</span>
                    <h4 style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{selectedBlock.type}</h4>
                 </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Titre de la section</label>
                <input 
                  type="text" 
                  value={selectedBlock.data.title || ''}
                  onChange={(e) => setBlocks(blocks.map(b => b.id === selectedBlockId ? {...b, data: {...b.data, title: e.target.value}} : b))}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>

              {selectedBlock.type === 'hero' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Sous-titre</label>
                  <textarea 
                    value={selectedBlock.data.subtitle || ''}
                    onChange={(e) => setBlocks(blocks.map(b => b.id === selectedBlockId ? {...b, data: {...b.data, subtitle: e.target.value}} : b))}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '80px' }}
                  />
                </div>
              )}

              {selectedBlock.type === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>Contenu Principal</label>
                  <textarea 
                    value={selectedBlock.data.body || ''}
                    onChange={(e) => setBlocks(blocks.map(b => b.id === selectedBlockId ? {...b, data: {...b.data, body: e.target.value}} : b))}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '150px' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '50%', color: '#94a3b8' }}>
              <Layout size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.875rem' }}>Sélectionnez une section sur le canevas pour la personnaliser de A à Z.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default PageBuilder;
