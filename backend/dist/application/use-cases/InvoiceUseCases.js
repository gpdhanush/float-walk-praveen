import { AppError, ErrorCodes } from "../../utils/errors.js";
import { logger } from "../../utils/logger.js";
import { randomUUID } from "crypto";
function resolveInvoiceStatus(requestedStatus, totalAmount, paidAmount) {
    if (requestedStatus)
        return requestedStatus;
    if (totalAmount > 0 && paidAmount >= totalAmount)
        return "paid";
    if (paidAmount > 0)
        return "partial";
    return "pending";
}
export class InvoiceUseCases {
    invoiceRepo;
    customerRepo;
    codeGenerator;
    constructor(invoiceRepo, customerRepo, codeGenerator) {
        this.invoiceRepo = invoiceRepo;
        this.customerRepo = customerRepo;
        this.codeGenerator = codeGenerator;
    }
    async create(data) {
        console.log("[InvoiceUseCases] create called with items:", data.items?.length || 0);
        const customer = await this.customerRepo.findById(data.customerId);
        if (!customer) {
            throw new AppError(ErrorCodes.NOT_FOUND, "Customer not found", 404);
        }
        let code = data.invoiceNumber;
        if (!code) {
            const prefix = data.type === "Advance Payment" ? "ADV" : "INV";
            code = await this.codeGenerator.generate(prefix);
        }
        const totalAmount = Number(data.grandTotal ?? data.totalAmount ?? 0);
        const paidAmount = Number(data.advancePaid ?? data.paidAmount ?? 0);
        const status = resolveInvoiceStatus(data.status, totalAmount, paidAmount);
        const invoice = await this.invoiceRepo.create({
            id: randomUUID(),
            code,
            customerId: data.customerId,
            status,
            type: data.type ?? "Invoice",
            totalAmount,
            subtotal: data.subtotal,
            gstPercent: data.gstPercent,
            gstAmount: data.gstAmount,
            paidAmount,
            notes: data.notes ?? null,
            createdBy: data.createdBy,
        });
        console.log("[InvoiceUseCases] Invoice created, ID:", invoice.id);
        if (data.items && data.items.length > 0) {
            console.log("[InvoiceUseCases] Adding", data.items.length, "items");
            for (const item of data.items) {
                const legacy = item;
                const unitPrice = item.unitPrice ?? legacy.price ?? 0;
                const scanPrice = item.scanPrice ?? legacy.scan ?? 0;
                console.log("[InvoiceUseCases] Adding item:", item.productName, "qty:", item.quantity);
                await this.invoiceRepo.addItem({
                    id: randomUUID(),
                    invoiceId: invoice.id,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice,
                    scanPrice,
                    totalPrice: item.quantity * unitPrice + scanPrice,
                    productId: item.productId ?? null,
                });
            }
            console.log("[InvoiceUseCases] All items added successfully");
        }
        else {
            console.warn("[InvoiceUseCases] No items to add!");
        }
        return invoice;
    }
    async getById(id) {
        return this.invoiceRepo.findById(id);
    }
    async getWithItems(id) {
        const invoice = await this.invoiceRepo.findById(id);
        if (!invoice)
            return { invoice: null, items: [], payments: [] };
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
    async list(filter) {
        return this.invoiceRepo.findMany(filter);
    }
    async addItem(invoiceId, input) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice)
            throw new AppError(ErrorCodes.NOT_FOUND, "Invoice not found", 404);
        const totalPrice = input.quantity * input.unitPrice + (input.scanPrice || 0);
        const item = await this.invoiceRepo.addItem({
            id: randomUUID(),
            invoiceId,
            productName: input.productName,
            quantity: input.quantity,
            unitPrice: input.unitPrice,
            scanPrice: input.scanPrice || 0,
            totalPrice,
            productId: input.productId ?? null,
        });
        const newTotal = Number(invoice.totalAmount) + totalPrice;
        await this.invoiceRepo.update(invoiceId, { totalAmount: newTotal });
        return item;
    }
    async removeItem(invoiceId, itemId) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice)
            throw new AppError(ErrorCodes.NOT_FOUND, "Invoice not found", 404);
        const items = await this.invoiceRepo.getItems(invoiceId);
        const item = items.find((i) => i.id === itemId);
        if (!item)
            return false;
        await this.invoiceRepo.removeItem(itemId);
        const newTotal = Math.max(0, Number(invoice.totalAmount) - Number(item.totalPrice));
        await this.invoiceRepo.update(invoiceId, { totalAmount: newTotal });
        return true;
    }
    async addPayment(invoiceId, input) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice)
            throw new AppError(ErrorCodes.NOT_FOUND, "Invoice not found", 404);
        await this.invoiceRepo.addPayment({
            id: randomUUID(),
            invoiceId,
            amount: input.amount,
            method: input.method,
            reference: input.reference ?? null,
        });
        const newPaid = Number(invoice.paidAmount) + input.amount;
        await this.invoiceRepo.update(invoiceId, { paidAmount: newPaid });
        return true;
    }
    async updateStatus(invoiceId, status) {
        const invoice = await this.invoiceRepo.findById(invoiceId);
        if (!invoice)
            return null;
        return this.invoiceRepo.update(invoiceId, { status });
    }
    async update(id, data) {
        console.log("[InvoiceUseCases] update called for invoice:", id);
        console.log("[InvoiceUseCases] Update data:", {
            type: data.type,
            status: data.status,
            totalAmount: data.grandTotal ?? data.totalAmount,
            paidAmount: data.advancePaid ?? data.paidAmount,
            subtotal: data.subtotal,
            gstPercent: data.gstPercent,
            gstAmount: data.gstAmount,
            itemsCount: data.items?.length || 0,
        });
        const invoice = await this.invoiceRepo.findById(id);
        if (!invoice)
            throw new AppError(ErrorCodes.NOT_FOUND, "Invoice not found", 404);
        if (data.customerId && data.customerId !== invoice.customerId) {
            const customer = await this.customerRepo.findById(data.customerId);
            if (!customer) {
                throw new AppError(ErrorCodes.NOT_FOUND, "Customer not found", 404);
            }
        }
        const totalAmount = Number(data.grandTotal ?? data.totalAmount ?? invoice.totalAmount ?? 0);
        const paidAmount = Number(data.advancePaid ?? data.paidAmount ?? invoice.paidAmount ?? 0);
        const status = resolveInvoiceStatus(data.status, totalAmount, paidAmount);
        const isAdvanceConversion = invoice.type === "Advance Payment" && data.type === "Invoice";
        const code = isAdvanceConversion
            ? await this.codeGenerator.generate("INV")
            : undefined;
        const updated = await this.invoiceRepo.update(id, {
            ...(data.customerId ? { customerId: data.customerId } : {}),
            status,
            type: data.type,
            ...(code ? { code } : {}),
            totalAmount,
            paidAmount,
            notes: data.notes,
            subtotal: data.subtotal,
            gstPercent: data.gstPercent,
            gstAmount: data.gstAmount,
        });
        console.log("[InvoiceUseCases] Invoice updated in DB:", updated?.id);
        if (data.items) {
            console.log("[InvoiceUseCases] Updating items, count:", data.items.length);
            // Delete existing items
            const oldItems = await this.invoiceRepo.getItems(id);
            console.log("[InvoiceUseCases] Deleting", oldItems.length, "old items");
            for (const item of oldItems) {
                await this.invoiceRepo.removeItem(item.id);
            }
            // Add new items
            console.log("[InvoiceUseCases] Adding", data.items.length, "new items");
            for (const item of data.items) {
                const legacy = item;
                const unitPrice = item.unitPrice ?? legacy.price ?? 0;
                const scanPrice = item.scanPrice ?? legacy.scan ?? 0;
                console.log("[InvoiceUseCases] Adding item:", item.productName, "qty:", item.quantity);
                await this.invoiceRepo.addItem({
                    id: crypto.randomUUID(),
                    invoiceId: id,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice,
                    scanPrice,
                    totalPrice: item.quantity * unitPrice + scanPrice,
                    productId: item.productId ?? null,
                });
            }
            console.log("[InvoiceUseCases] All items updated successfully");
        }
        else {
            console.warn("[InvoiceUseCases] No items in update data!");
        }
        return updated;
    }
    async sendInvoiceEmail(invoiceId, toEmail) {
        const { invoice, items } = await this.getWithItems(invoiceId);
        if (!invoice)
            throw new AppError(ErrorCodes.NOT_FOUND, "Invoice not found", 404);
        logger.info("Invoice email (no-op): would send", {
            invoiceId,
            to: toEmail,
            code: invoice.code,
            total: invoice.totalAmount,
            itemsCount: items.length,
        });
    }
    async sendInvoiceWhatsApp(invoiceId, toMobile) {
        const { invoice } = await this.getWithItems(invoiceId);
        if (!invoice)
            throw new AppError(ErrorCodes.NOT_FOUND, "Invoice not found", 404);
        logger.info("Invoice WhatsApp (no-op): would send", {
            invoiceId,
            to: toMobile,
            code: invoice.code,
            total: invoice.totalAmount,
        });
    }
    async delete(id) {
        return this.invoiceRepo.softDelete(id);
    }
}
//# sourceMappingURL=InvoiceUseCases.js.map