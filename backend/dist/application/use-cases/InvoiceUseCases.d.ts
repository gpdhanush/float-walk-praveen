import type { Invoice, InvoiceStatus } from "../../domain/entities/Invoice.js";
import type { InvoiceItem } from "../../domain/entities/InvoiceItem.js";
import type { IInvoiceRepository, FindInvoicesFilter } from "../../domain/repositories/IInvoiceRepository.js";
import type { CodeGeneratorService } from "../services/CodeGeneratorService.js";
export interface AddItemInput {
    productName: string;
    quantity: number;
    unitPrice: number;
    scanPrice?: number;
    productId?: string;
}
export interface AddPaymentInput {
    amount: number;
    method: string;
    reference?: string;
}
export declare class InvoiceUseCases {
    private readonly invoiceRepo;
    private readonly customerRepo;
    private readonly codeGenerator;
    constructor(invoiceRepo: IInvoiceRepository, customerRepo: {
        findById(id: string): Promise<unknown>;
    }, codeGenerator: CodeGeneratorService);
    create(data: {
        customerId: string;
        createdBy: string;
        notes?: string;
        items?: AddItemInput[];
        totalAmount?: number;
        paidAmount?: number;
        invoiceNumber?: string;
        status?: InvoiceStatus;
        type?: "Invoice" | "Advance Payment";
        subtotal?: number;
        gstPercent?: number;
        gstAmount?: number;
        grandTotal?: number;
        advancePaid?: number;
    }): Promise<Invoice>;
    getById(id: string): Promise<Invoice | null>;
    getWithItems(id: string): Promise<{
        invoice: Invoice | null;
        items: InvoiceItem[];
        payments: {
            id: string;
            amount: number;
            method: string;
            reference: string | null;
        }[];
    }>;
    list(filter: FindInvoicesFilter): Promise<{
        invoices: Invoice[];
        total: number;
    }>;
    addItem(invoiceId: string, input: AddItemInput): Promise<InvoiceItem>;
    removeItem(invoiceId: string, itemId: string): Promise<boolean>;
    addPayment(invoiceId: string, input: AddPaymentInput): Promise<boolean>;
    updateStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice | null>;
    update(id: string, data: {
        customerId?: string;
        notes?: string;
        items?: AddItemInput[];
        totalAmount?: number;
        paidAmount?: number;
        status?: InvoiceStatus;
        type?: "Invoice" | "Advance Payment";
        subtotal?: number;
        gstPercent?: number;
        gstAmount?: number;
        grandTotal?: number;
        advancePaid?: number;
    }): Promise<Invoice | null>;
    sendInvoiceEmail(invoiceId: string, toEmail: string): Promise<void>;
    sendInvoiceWhatsApp(invoiceId: string, toMobile: string): Promise<void>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=InvoiceUseCases.d.ts.map