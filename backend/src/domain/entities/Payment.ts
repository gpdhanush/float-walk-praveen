import type { BaseEntity } from './BaseEntity.js';

export interface Payment extends BaseEntity {
  invoiceId: string;
  amount: number;
  method: string;
  reference: string | null;
}
