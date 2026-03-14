import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Star, Users } from 'lucide-react';
import { useTenant } from '../providers/TenantProvider';

export const PublicDisplay: React.FC = () => {
  const { tenant } = useTenant();

  if (!tenant) return null;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--surface-50) 0%, white 100%)'
      }}>
        
        <div style={{ 
          display: 'inline-block', 
          padding: '0.5rem 1rem', 
          background: 'rgba(59, 130, 246, 0.1)', 
          color: 'var(--primary)', 
          borderRadius: 'var(--radius-full)', 
          fontWeight: 600, 
          marginBottom: '2rem' 
        }}>
          Bienvenue à {tenant.name}
        </div>

        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', maxWidth: '900px' }}>
          {tenant.tagline || 'Excellence et Réussite.'}
        </h1>

        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px' }}>
          Découvrez notre établissement, nos programmes académiques, et rejoignez une communauté engagée pour l'avenir de vos enfants.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Inscriptions {new Date().getFullYear()} <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Feature Showcase */}
      <section style={{ padding: '5rem 2rem', background: 'var(--surface-50)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem' }}>Pourquoi Nous Choisir ?</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Un environnement conçu pour l'épanouissement académique.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="glass-card">
              <BookOpen size={32} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Pédagogie Moderne</h3>
              <p style={{ color: 'var(--text-muted)' }}>Des programmes mis à jour régulièrement pour répondre aux défis contemporains.</p>
            </div>

            <div className="glass-card">
              <Users size={32} color="var(--secondary)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Équipe Qualifiée</h3>
              <p style={{ color: 'var(--text-muted)' }}>Des professeurs passionnés et dédiés à la réussite de chaque élève.</p>
            </div>

            <div className="glass-card">
              <Star size={32} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Excellence Reconnue</h3>
              <p style={{ color: 'var(--text-muted)' }}>Des résultats attestent de l'engagement de notre école année après année.</p>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
};
