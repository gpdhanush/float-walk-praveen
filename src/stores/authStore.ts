import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const defaultUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'admin' as Role, name: 'Admin' },
  { id: '2', username: 'employee', password: 'emp123', role: 'employee' as Role, name: 'Employee' },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (username, password) => {
        const found = defaultUsers.find(u => u.username === username && u.password === password);
        if (found) {
          set({ user: { id: found.id, username: found.username, role: found.role, name: found.name }, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-store' }
  )
);
