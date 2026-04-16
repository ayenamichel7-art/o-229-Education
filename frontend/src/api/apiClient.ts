import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// ─── Types ──────────────────────────────────────────────
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Base URL of your Laravel backend (via Docker / Nginx)
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost";

// Main API client — always communicates with /api/v1/*
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000, // 30 second timeout
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: true, // Needed for Sanctum cookie-based auth on SPA
});

// Request Interceptor — Inject Tenant domain header for multi-tenant
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tenantDomain = window.location.hostname;
    if (tenantDomain) {
      config.headers["X-Tenant-Domain"] = tenantDomain;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response Interceptor — Global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        // Session expired or unauthorized
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        break;

      case 403:
        // Forbidden — user lacks permissions
        console.warn(
          "[API] Forbidden: insufficient permissions",
          error.config?.url,
        );
        break;

      case 419:
        // CSRF token mismatch — refresh the page
        console.warn("[API] CSRF token expired, refreshing...");
        window.location.reload();
        break;

      case 422:
        // Validation errors — let the calling code handle these
        break;

      case 429:
        // Rate limited
        console.warn("[API] Rate limited. Too many requests.");
        break;

      case 500:
      case 502:
      case 503:
        // Server error — log for debugging
        console.error("[API] Server error:", status, error.config?.url);
        // TODO: Send to Sentry when configured
        break;

      default:
        if (!error.response) {
          // Network error (no response received)
          console.error("[API] Network error — server unreachable");
        }
        break;
    }

    return Promise.reject(error);
  },
);

// Sanctum CSRF client — used only for initial cookie fetch
export const sanctumClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: { Accept: "application/json" },
});
