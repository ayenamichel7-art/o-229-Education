import { create } from "zustand";
import { apiClient, sanctumClient } from "../api/apiClient";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  tenant_id: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // Step 1: Fetch CSRF cookie from Sanctum (required for SPA authentication)
      await sanctumClient.get("/sanctum/csrf-cookie");

      // Step 2: Authenticate via Laravel Sanctum
      await apiClient.post("/auth/login", credentials);

      // Step 3: Fetch authenticated user profile
      const res = await apiClient.get("/auth/me");
      set({
        user: res.data.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const message = err.response?.data?.message || "Identifiants incorrects";
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  checkAuth: async () => {
    try {
      const res = await apiClient.get("/auth/me");
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
