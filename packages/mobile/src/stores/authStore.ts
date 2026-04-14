import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface Tenant {
  id: string;
  nome: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  rechamadaCooldownSeconds: number;
}

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  tenantId: string;
  tenant?: Tenant;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  init: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const userStr = await SecureStore.getItemAsync('user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr) });
      }
    } catch {}
    set({ isInitialized: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await SecureStore.setItemAsync('token', data.accessToken);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));
      set({ token: data.accessToken, user: data.user, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, token: null });
  },
}));
