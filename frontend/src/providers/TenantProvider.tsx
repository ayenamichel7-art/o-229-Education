import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/apiClient';
import { TenantErrorFallback } from '../components/TenantErrorFallback';

interface TenantConfig {
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  sealUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  location?: {
    address: string | null;
    google_place_id: string | null;
    latitude: number | null;
    longitude: number | null;
    maps_url: string | null;
    is_verified: boolean;
  };
  settings?: {
    report_card?: {
      primary_color?: string;
      header_style?: string;
    };
    features?: Record<string, boolean>;
  };
}

interface TenantContextProps {
  tenant: TenantConfig | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextProps>({
  tenant: null,
  isLoading: true,
  error: null,
});

export const useTenant = () => useContext(TenantContext);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantConfig = async () => {
      try {
        const response = await apiClient.get('/config');
        const data = response.data.data;
        
        setTenant(data);
        
        // Dynamically Inject CSS Variables for White-Labeling!
        if (data.primaryColor) {
          document.documentElement.style.setProperty('--primary', data.primaryColor);
          // Darken the primary color slightly for hover states
          document.documentElement.style.setProperty('--primary-dark', adjustColorBrightness(data.primaryColor, -20));
        }
        if (data.secondaryColor) {
          document.documentElement.style.setProperty('--secondary', data.secondaryColor);
        }
        if (data.accentColor) {
          document.documentElement.style.setProperty('--accent', data.accentColor);
        }
        
        document.title = `${data.name} | o-229 Education`;
        
        // Inject favicon if it exists
        if (data.logoUrl) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (link) {
            link.href = data.logoUrl;
          }
        }

      } catch (err) {
        console.error('Failed to load tenant config', err);
        setError('School configuration could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantConfig();
  }, []);

  if (error && !isLoading) {
    return <TenantErrorFallback error={error} />;
  }

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

// Helper function to darken or lighten a hex color dynamically
const adjustColorBrightness = (hex: string, percent: number) => {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));

  const newHex = `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
  return newHex;
};
