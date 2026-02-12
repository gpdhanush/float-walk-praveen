import type { Invoice, InvoiceItem, Payment } from '../entities/index.js';

export interface FindInvoicesFilter {
  customerId?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface IInvoiceRepository {
  create(data: Omit<Invoice, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Invoice>;
  findById(id: string): Promise<Invoice | null>;
  findByCode(code: string): Promise<Invoice | null>;
  findMany(filter: FindInvoicesFilter): Promise<{ invoices: Invoice[]; total: number }>;
  update(id: string, data: Partial<Invoice>): Promise<Invoice | null>;
  softDelete(id: string): Promise<boolean>;
  addItem(data: Omit<InvoiceItem, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<InvoiceItem>;
  getItems(invoiceId: string): Promise<InvoiceItem[]>;
  removeItem(itemId: string): Promise<boolean>;
  addPayment(data: Omit<Payment, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Payment>;
  getPayments(invoiceId: string): Promise<Payment[]>;
}
