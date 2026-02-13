import type { Invoice, InvoiceStatus } from '../../domain/entities/Invoice.js';
import type { InvoiceItem } from '../../domain/entities/InvoiceItem.js';
import type {
  IInvoiceRepository,
  FindInvoicesFilter,
} from '../../domain/repositories/IInvoiceRepository.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import type { CodeGeneratorService } from '../services/CodeGeneratorService.js';
import { logger } from '../../utils/logger.js';

export interface AddItemInput {
  productName: string;
  quantity: number;
  unitPrice: number;
  productId?: string;
}

export interface AddPaymentInput {
  amount: number;
  method: string;
  reference?: string;
}

export class InvoiceUseCases {
  constructor(
    private readonly invoiceRepo: IInvoiceRepository,
    private readonly customerRepo: { findById(id: string): Promise<unknown> },
    private readonly codeGenerator: CodeGeneratorService
  ) {}

  async create(data: {
    customerId: string;
    createdBy: string;
    notes?: string;
    items?: AddItemInput[];
    totalAmount?: number;
    paidAmount?: number;
    invoiceNumber?: string;
    status?: InvoiceStatus;
    type?: string;
    subtotal?: number;
    gstPercent?: number;
    gstAmount?: number;
    grandTotal?: number;
    advancePaid?: number;
  }): Promise<Invoice> {
    console.log('[InvoiceUseCases] create called with items:', data.items?.length || 0);
    
    const customer = await this.customerRepo.findById(data.customerId);
    if (!customer) {
      throw new AppError(ErrorCodes.NOT_FOUND, 'Customer not found', 404);
    }
    
    let code = data.invoiceNumber;
    if (!code) {
        const prefix = data.type === 'Quotation' ? 'QUO' : data.type === 'Advance Payment' ? 'ADV' : 'INV';
        code = await this.codeGenerator.generate(prefix as any);
    }

    const invoice = await this.invoiceRepo.create({
      id: crypto.randomUUID(),
      code,
      customerId: data.customerId,
      status: data.status ?? 'pending',
      type: data.type ?? 'Invoice',
      totalAmount: data.grandTotal ?? data.totalAmount ?? 0,
      subtotal: data.subtotal,
      gstPercent: data.gstPercent,
      gstAmount: data.gstAmount,
      paidAmount: data.advancePaid ?? data.paidAmount ?? 0,
      notes: data.notes ?? null,
      createdBy: data.createdBy,
    });

    console.log('[InvoiceUseCases] Invoice created, ID:', invoice.id);

    if (data.items && data.items.length > 0) {
      console.log('[InvoiceUseCases] Adding', data.items.length, 'items');
      for (const item of data.items) {
        console.log('[InvoiceUseCases] Adding item:', item.productName, 'qty:', item.quantity);
        await this.invoiceRepo.addItem({
          id: crypto.randomUUID(),
          invoiceId: invoice.id,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice || (item as any).price || 0,
          totalPrice: item.quantity * (item.unitPrice || (item as any).price || 0),
          productId: item.productId ?? null,
        });
      }
      console.log('[InvoiceUseCases] All items added successfully');
    } else {
      console.warn('[InvoiceUseCases] No items to add!');
    }

    return invoice;
  }

  async getById(id: string): Promise<Invoice | null> {
    return this.invoiceRepo.findById(id);
  }

  async getWithItems(id: string): Promise<{
    invoice: Invoice | null;
    items: InvoiceItem[];
    payments: { id: string; amount: number; method: string; reference: string | null }[];
  }> {
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) return { invoice: null, items: [], payments: [] };
    const items = await this.invoiceRepo.getItems(id);
    const payments = await this.invoiceRepo.getPayments(id);
    return {
      invoice,
      items,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
      })),
    };
  }

  async list(filter: FindInvoicesFilter): Promise<{ invoices: Invoice[]; total: number }> {
    return this.invoiceRepo.findMany(filter);
  }

  async addItem(invoiceId: string, input: AddItemInput): Promise<InvoiceItem> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) throw new AppError(ErrorCodes.NOT_FOUND, 'Invoice not found', 404);
    const totalPrice = input.quantity * input.unitPrice;
    const item = await this.invoiceRepo.addItem({
      id: crypto.randomUUID(),
      invoiceId,
      productName: input.productName,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalPrice,
      productId: input.productId ?? null,
    });
    const newTotal = Number(invoice.totalAmount) + totalPrice;
    await this.invoiceRepo.update(invoiceId, { totalAmount: newTotal });
    return item;
  }

  async removeItem(invoiceId: string, itemId: string): Promise<boolean> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) throw new AppError(ErrorCodes.NOT_FOUND, 'Invoice not found', 404);
    const items = await this.invoiceRepo.getItems(invoiceId);
    const item = items.find((i) => i.id === itemId);
    if (!item) return false;
    await this.invoiceRepo.removeItem(itemId);
    const newTotal = Math.max(0, Number(invoice.totalAmount) - Number(item.totalPrice));
    await this.invoiceRepo.update(invoiceId, { totalAmount: newTotal });
    return true;
  }

  async addPayment(invoiceId: string, input: AddPaymentInput): Promise<boolean> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) throw new AppError(ErrorCodes.NOT_FOUND, 'Invoice not found', 404);
    await this.invoiceRepo.addPayment({
      id: crypto.randomUUID(),
      invoiceId,
      amount: input.amount,
      method: input.method,
      reference: input.reference ?? null,
    });
    const newPaid = Number(invoice.paidAmount) + input.amount;
    await this.invoiceRepo.update(invoiceId, { paidAmount: newPaid });
    return true;
  }

  async updateStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice | null> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice) return null;

    return this.invoiceRepo.update(invoiceId, { status });
  }

  async update(id: string, data: {
    notes?: string;
    items?: AddItemInput[];
    totalAmount?: number;
    paidAmount?: number;
    status?: InvoiceStatus;
    type?: string;
    subtotal?: number;
    gstPercent?: number;
    gstAmount?: number;
    grandTotal?: number;
    advancePaid?: number;
  }): Promise<Invoice | null> {
    console.log('[InvoiceUseCases] update called for invoice:', id);
    console.log('[InvoiceUseCases] Update data:', {
      type: data.type,
      status: data.status,
      totalAmount: data.grandTotal ?? data.totalAmount,
      paidAmount: data.advancePaid ?? data.paidAmount,
      subtotal: data.subtotal,
      gstPercent: data.gstPercent,
      gstAmount: data.gstAmount,
      itemsCount: data.items?.length || 0
    });
    
    const invoice = await this.invoiceRepo.findById(id);
    if (!invoice) throw new AppError(ErrorCodes.NOT_FOUND, 'Invoice not found', 404);

    const updated = await this.invoiceRepo.update(id, {
        status: data.status,
        type: data.type,
        totalAmount: data.grandTotal ?? data.totalAmount,
        paidAmount: data.advancePaid ?? data.paidAmount,
        notes: data.notes,
        subtotal: data.subtotal,
        gstPercent: data.gstPercent,
        gstAmount: data.gstAmount,
    });
    
    console.log('[InvoiceUseCases] Invoice updated in DB:', updated?.id);

    if (data.items) {
        console.log('[InvoiceUseCases] Updating items, count:', data.items.length);
        // Delete existing items
        const oldItems = await this.invoiceRepo.getItems(id);
        console.log('[InvoiceUseCases] Deleting', oldItems.length, 'old items');
        for (const item of oldItems) {
            await this.invoiceRepo.removeItem(item.id);
        }
        // Add new items
        console.log('[InvoiceUseCases] Adding', data.items.length, 'new items');
        for (const item of data.items) {
            console.log('[InvoiceUseCases] Adding item:', item.productName, 'qty:', item.quantity);
            await this.invoiceRepo.addItem({
                id: crypto.randomUUID(),
                invoiceId: id,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice || (item as any).price || 0,
                totalPrice: item.quantity * (item.unitPrice || (item as any).price || 0),
                productId: item.productId ?? null,
            });
        }
        console.log('[InvoiceUseCases] All items updated successfully');
    } else {
        console.warn('[InvoiceUseCases] No items in update data!');
    }

    return updated;
  }

  async sendInvoiceEmail(invoiceId: string, toEmail: string): Promise<void> {
    const { invoice, items } = await this.getWithItems(invoiceId);
    if (!invoice) throw new AppError(ErrorCodes.NOT_FOUND, 'Invoice not found', 404);
    logger.info('Invoice email (no-op): would send', { invoiceId, to: toEmail, code: invoice.code, total: invoice.totalAmount, itemsCount: items.length });
  }

  async sendInvoiceWhatsApp(invoiceId: string, toMobile: string): Promise<void> {
    const { invoice } = await this.getWithItems(invoiceId);
    if (!invoice) throw new AppError(ErrorCodes.NOT_FOUND, 'Invoice not found', 404);
    logger.info('Invoice WhatsApp (no-op): would send', { invoiceId, to: toMobile, code: invoice.code, total: invoice.totalAmount });
  }

  async delete(id: string): Promise<boolean> {
    return this.invoiceRepo.softDelete(id);
  }
}
