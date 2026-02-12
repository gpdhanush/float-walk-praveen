import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/services/api';

export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        try {
          const res = await api.post('/auth/login', { email, password });
          if (res.success && res.data) {
             const { user, accessToken } = res.data;
             const normalizedUser = { ...user, role: user.role.toLowerCase() };
             set({ user: normalizedUser, token: accessToken, isAuthenticated: true });
             
             // Wait for localStorage to sync
             await new Promise(resolve => setTimeout(resolve, 50));
             return true;
          }
          return false;
        } catch (e) {
          console.error(e);
          return false;
        }
      },
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
);
