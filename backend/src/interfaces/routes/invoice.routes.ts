import { Router } from 'express';
import * as InvoiceController from '../controllers/InvoiceController.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  addItemSchema,
  addPaymentSchema,
  updateStatusSchema,
  listInvoicesSchema,
  sendEmailSchema,
  sendWhatsAppSchema,
} from '../validators/invoice.validator.js';

export const invoiceRoutes = Router();

invoiceRoutes.use(authMiddleware(authService));

invoiceRoutes.get('/', validate(listInvoicesSchema, 'query'), InvoiceController.listInvoices);
invoiceRoutes.post('/', validate(createInvoiceSchema), InvoiceController.createInvoice);
invoiceRoutes.put('/:id', validate(updateInvoiceSchema), InvoiceController.updateInvoice);
invoiceRoutes.get('/:id', InvoiceController.getInvoice);
invoiceRoutes.patch('/:id/status', validate(updateStatusSchema), InvoiceController.updateStatus);
invoiceRoutes.post('/:id/items', validate(addItemSchema), InvoiceController.addItem);
invoiceRoutes.delete('/:id/items/:itemId', InvoiceController.removeItem);
invoiceRoutes.post('/:id/payments', validate(addPaymentSchema), InvoiceController.addPayment);
invoiceRoutes.post('/:id/send-email', validate(sendEmailSchema), InvoiceController.sendEmail);
invoiceRoutes.post('/:id/send-whatsapp', validate(sendWhatsAppSchema), InvoiceController.sendWhatsApp);
invoiceRoutes.delete('/:id', InvoiceController.deleteInvoice);
