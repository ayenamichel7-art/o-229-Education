import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  Coffee, 
  Plus, 
  UserPlus, 
  Settings, 
  ChevronRight, 
  Users, 
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';

export const AncillaryServices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transport' | 'canteen'>('transport');
  const [transportRoutes, setTransportRoutes] = useState<any[]>([]);
  const [canteenPlans, setCanteenPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'transport') {
        const res = await apiClient.get('/transport');
        setTransportRoutes(res.data);
      } else {
        const res = await apiClient.get('/canteen');
        setCanteenPlans(res.data);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Services Annexes</h1>
          <p style={{ color: 'var(--text-muted)' }}>Gérez le transport scolaire et la restauration pour vos élèves.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button className="btn btn-secondary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Settings size={18} /> Configuration
           </button>
           <button className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Plus size={18} /> {activeTab === 'transport' ? 'Nouveau Circuit' : 'Nouveau Menu'}
           </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: '#F1F5F9', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
         <button 
           onClick={() => setActiveTab('transport')}
           style={{ 
             display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
             background: activeTab === 'transport' ? 'white' : 'transparent',
             color: activeTab === 'transport' ? 'var(--primary)' : '#64748B',
             boxShadow: activeTab === 'transport' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
             fontWeight: 600
           }}
         >
           <Bus size={18} /> Transport
         </button>
         <button 
           onClick={() => setActiveTab('canteen')}
           style={{ 
             display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
             background: activeTab === 'canteen' ? 'white' : 'transparent',
             color: activeTab === 'canteen' ? 'var(--primary)' : '#64748B',
             boxShadow: activeTab === 'canteen' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none',
             fontWeight: 600
           }}
         >
           <Coffee size={18} /> Cantine Scolaire
         </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>Chargement...</div>
      ) : activeTab === 'transport' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {transportRoutes.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
               <Bus size={48} style={{ margin: '0 auto 1.5rem', color: '#CBD5E1' }} />
               <p>Aucun circuit de transport configuré pour le moment.</p>
            </div>
          ) : transportRoutes.map(route => (
            <div key={route.id} className="glass-card h-full flex flex-col hover-scale" style={{ background: 'white', border: '1px solid #F1F5F9', padding: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', color: 'var(--primary)' }}>
                     <Bus size={24} />
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: '#ECFDF5', color: '#10B981' }}>
                     {route.is_active ? 'Actif' : 'Inactif'}
                  </div>
               </div>
               
               <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{route.name}</h3>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Véhicule: {route.vehicle_reg || 'N/A'}</p>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                     <Users size={16} color="#64748B" />
                     <span><b>{route.subscriptions_count}</b> /{route.capacity} élèves inscrits</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                     <UserPlus size={16} color="#64748B" />
                     <span>Chauffeur: {route.driver_name || 'Non assigné'}</span>
                  </div>
               </div>

               <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{route.monthly_cost} FCFA /mois</span>
                  <button className="btn btn-ghost" style={{ padding: '6px' }}><ChevronRight size={20} /></button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {canteenPlans.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
               <Coffee size={48} style={{ margin: '0 auto 1.5rem', color: '#CBD5E1' }} />
               <p>Aucun plan de cantine configuré pour le moment.</p>
            </div>
          ) : canteenPlans.map(plan => (
            <div key={plan.id} className="glass-card hover-scale" style={{ background: 'white', padding: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                     <Coffee size={24} />
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: '#ECFDF5', color: '#10B981' }}>
                     {plan.is_active ? 'Ouvert' : 'Fermé'}
                  </div>
               </div>

               <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{plan.name}</h3>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  {plan.description || 'Description du menu non fournie.'}
               </p>

               <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '4px' }}>
                     <Users size={16} />
                     <span>Inscrits: <b>{plan.subscriptions_count}</b> élèves</span>
                  </div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tarif mensuel</span>
                     <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>{plan.cost_per_month} CFA</span>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem' }}>Gérer</button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--gradient-primary)', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
         <div style={{ padding: '12px', background: 'rgba(255,255,255,0.2)', borderRadius: '15px' }}>
            <AlertCircle size={32} />
         </div>
         <div>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Rappel Facturation</h4>
            <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.9rem' }}>Les frais des services annexes sont automatiquement ajoutés aux factures mensuelles des parents inscrits.</p>
         </div>
      </div>
    </div>
  );
};
