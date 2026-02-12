import type { BaseEntity } from './BaseEntity.js';

export interface Customer extends BaseEntity {
  name: string;
  mobile: string;
  whatsapp?: string | null;
  altContact?: string | null;
  email: string | null;
  gender?: string | null;
  address: string | null;
  notes?: string | null;
}

