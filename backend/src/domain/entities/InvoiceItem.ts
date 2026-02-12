import type { BaseEntity } from './BaseEntity.js';

export interface InvoiceItem extends BaseEntity {
  invoiceId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId: string | null;
}
