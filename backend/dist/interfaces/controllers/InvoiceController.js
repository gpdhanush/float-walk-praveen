import { invoiceUseCases } from "../../container.js";
import { getParamId } from "../../utils/request.js";
export async function createInvoice(req, res, next) {
    try {
        const userId = req.user
            ?.userId;
        console.log("[InvoiceController] createInvoice called. userId:", userId);
        console.log("[InvoiceController] req.body:", JSON.stringify(req.body, null, 2));
        if (!userId) {
            console.error("[InvoiceController] No userId found in request!");
            res
                .status(401)
                .json({
                success: false,
                code: "UNAUTHORIZED",
                message: "Not authenticated",
            });
            return;
        }
        console.log("[InvoiceController] Items received:", req.body.items?.length || 0);
        const invoice = await invoiceUseCases.create({
            ...req.body,
            createdBy: userId,
        });
        res.status(201).json({ success: true, data: invoice });
    }
    catch (e) {
        console.error("[InvoiceController] ERROR in createInvoice:", e.message);
        if (e.stack)
            console.error(e.stack);
        next(e);
    }
}
export async function updateInvoice(req, res, next) {
    try {
        console.log("[InvoiceController] updateInvoice called for ID:", getParamId(req));
        console.log("[InvoiceController] Items received:", req.body.items?.length || 0);
        if (req.body.items) {
            console.log("[InvoiceController] First item:", req.body.items[0]);
        }
        const invoice = await invoiceUseCases.update(getParamId(req), req.body);
        if (!invoice) {
            res
                .status(404)
                .json({
                success: false,
                code: "NOT_FOUND",
                message: "Invoice not found",
            });
            return;
        }
        res.json({ success: true, data: invoice });
    }
    catch (e) {
        next(e);
    }
}
export async function getInvoice(req, res, next) {
    try {
        const result = await invoiceUseCases.getWithItems(getParamId(req));
        if (!result.invoice) {
            res
                .status(404)
                .json({
                success: false,
                code: "NOT_FOUND",
                message: "Invoice not found",
            });
            return;
        }
        res.json({ success: true, data: result });
    }
    catch (e) {
        next(e);
    }
}
export async function listInvoices(req, res, next) {
    try {
        const { invoices, total } = await invoiceUseCases.list(req.query);
        res.json({ success: true, data: invoices, meta: { total } });
    }
    catch (e) {
        next(e);
    }
}
export async function addItem(req, res, next) {
    try {
        const item = await invoiceUseCases.addItem(getParamId(req), req.body);
        res.status(201).json({ success: true, data: item });
    }
    catch (e) {
        next(e);
    }
}
export async function removeItem(req, res, next) {
    try {
        const ok = await invoiceUseCases.removeItem(getParamId(req), getParamId(req, "itemId"));
        if (!ok) {
            res
                .status(404)
                .json({ success: false, code: "NOT_FOUND", message: "Item not found" });
            return;
        }
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
export async function addPayment(req, res, next) {
    try {
        await invoiceUseCases.addPayment(getParamId(req), req.body);
        res.status(201).json({ success: true });
    }
    catch (e) {
        next(e);
    }
}
export async function updateStatus(req, res, next) {
    try {
        const invoice = await invoiceUseCases.updateStatus(getParamId(req), req.body.status);
        if (!invoice) {
            res
                .status(404)
                .json({
                success: false,
                code: "NOT_FOUND",
                message: "Invoice not found",
            });
            return;
        }
        res.json({ success: true, data: invoice });
    }
    catch (e) {
        next(e);
    }
}
export async function sendEmail(req, res, next) {
    try {
        const { email } = req.body;
        await invoiceUseCases.sendInvoiceEmail(getParamId(req), email);
        res.json({ success: true, message: "Email queued" });
    }
    catch (e) {
        next(e);
    }
}
export async function sendWhatsApp(req, res, next) {
    try {
        const { mobile } = req.body;
        await invoiceUseCases.sendInvoiceWhatsApp(getParamId(req), mobile);
        res.json({ success: true, message: "WhatsApp message queued" });
    }
    catch (e) {
        next(e);
    }
}
export async function deleteInvoice(req, res, next) {
    try {
        const ok = await invoiceUseCases.delete(getParamId(req));
        if (!ok) {
            res
                .status(404)
                .json({
                success: false,
                code: "NOT_FOUND",
                message: "Invoice not found",
            });
            return;
        }
        res.status(204).send();
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=InvoiceController.js.map