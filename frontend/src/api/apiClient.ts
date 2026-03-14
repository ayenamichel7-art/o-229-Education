import axios from 'axios';

// Base URL of your Laravel backend (via Docker / Nginx)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

// Main API client — always communicates with /api/v1/*
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Needed for Sanctum cookie-based auth on SPA
});

// Request Interceptor — Inject Tenant domain header for OMI multi-tenant
apiClient.interceptors.request.use(
  (config) => {
    const tenantDomain = window.location.hostname;
    if (tenantDomain) {
      config.headers['X-Tenant-Domain'] = tenantDomain;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — Global 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Sanctum CSRF client — used only for initial cookie fetch
export const sanctumClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Accept': 'application/json' },
});
