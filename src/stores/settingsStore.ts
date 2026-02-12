import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '@/lib/i18n';

interface StoreSettings {
  storeName: string;
  address: string;
  mobile: string;
  email: string;
  ownerName: string;
  gstPercent: number;
  gstNumber: string;
  logoUrl: string;
  theme: 'light' | 'dark';
  themeColor: string;
  language: Language;
}

interface SettingsState extends StoreSettings {
  updateSettings: (settings: Partial<StoreSettings>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      storeName: 'FootWear Pro',
      address: '123 Main Street, Chennai, TN 600001',
      mobile: '+91 98765 43210',
      email: 'info@footwearpro.com',
      ownerName: 'John Doe',
      gstPercent: 18,
      gstNumber: '33XXXXX1234X1ZX',
      logoUrl: '',
      theme: 'light',
      themeColor: 'blue',
      language: 'en',
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
      setTheme: (theme) => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        set({ theme });
      },
      setLanguage: (language) => set({ language }),
    }),
    { name: 'settings-store' }
  )
);
