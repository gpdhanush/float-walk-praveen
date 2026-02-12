import type { BaseEntity } from './BaseEntity.js';

export type InvoiceStatus = 'paid' | 'pending' | 'partial' | 'hold';

export interface Invoice extends BaseEntity {
  code: string;
  invoiceNumber?: string;
  customerId: string;
  customerName?: string;
  status: InvoiceStatus;
  type?: string; // Invoice, Quotation, Advance Payment
  totalAmount: number;
  subtotal?: number;
  gstPercent?: number;
  gstAmount?: number;
  grandTotal?: number;
  paidAmount: number;
  advancePaid?: number;
  balanceDue?: number;
  notes: string | null;
  createdBy: string;
}
