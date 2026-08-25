import type { Invoice, InvoiceItem, Payment } from '../../../domain/entities/index.js';
import type { IInvoiceRepository, FindInvoicesFilter } from '../../../domain/repositories/IInvoiceRepository.js';
export declare class InvoiceRepository implements IInvoiceRepository {
    create(data: Omit<Invoice, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Invoice>;
    findById(id: string): Promise<Invoice | null>;
    findByCode(code: string): Promise<Invoice | null>;
    findMany(filter: FindInvoicesFilter): Promise<{
        invoices: Invoice[];
        total: number;
    }>;
    update(id: string, data: Partial<Invoice>): Promise<Invoice | null>;
    softDelete(id: string): Promise<boolean>;
    addItem(data: Omit<InvoiceItem, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<InvoiceItem>;
    getItems(invoiceId: string): Promise<InvoiceItem[]>;
    removeItem(itemId: string): Promise<boolean>;
    addPayment(data: Omit<Payment, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Payment>;
    getPayments(invoiceId: string): Promise<Payment[]>;
}
//# sourceMappingURL=InvoiceRepository_OLD_BACKUP.d.ts.map