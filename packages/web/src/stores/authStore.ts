import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  tenantId: string | null;
  tenant?: any;
  selectedTenantId?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  selectedTenantId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => void;
  setSelectedTenant: (tenantId: string | null) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  selectedTenantId: null,

  init: () => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    const selectedTenantId = localStorage.getItem('selectedTenantId');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        set({
          token,
          user,
          selectedTenantId: selectedTenantId || user.selectedTenantId || null,
          isInitialized: true,
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const selectedTenantId = data.user.selectedTenantId ?? null;
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (selectedTenantId) {
        localStorage.setItem('selectedTenantId', selectedTenantId);
      } else {
        localStorage.removeItem('selectedTenantId');
      }
      set({ token: data.accessToken, user: data.user, selectedTenantId, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedTenantId');
    set({ user: null, token: null, selectedTenantId: null });
  },

  setSelectedTenant: async (tenantId: string | null) => {
    // Persiste no localStorage imediatamente
    if (tenantId) {
      localStorage.setItem('selectedTenantId', tenantId);
    } else {
      localStorage.removeItem('selectedTenantId');
    }
    set({ selectedTenantId: tenantId });

    // Persiste no banco em background
    try {
      await api.patch('/users/me/selected-tenant', { selectedTenantId: tenantId });
    } catch {
      // falha silenciosa — localStorage já garante persistência local
    }
  },
}));
