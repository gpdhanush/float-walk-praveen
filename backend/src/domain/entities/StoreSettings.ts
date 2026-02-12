export interface StoreSettings {
  id: string;
  storeName: string;
  ownerName: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  taxNumber: string | null;
  gstPercent: number;
  gstNumber: string | null;
  theme: 'light' | 'dark';
  themeColor: string;
  language: 'en' | 'ta';
  updatedAt: Date;
}
