import Joi from 'joi';

const itemSchema = Joi.object({
  productName: Joi.string().min(1).required(),
  quantity: Joi.number().min(0.01).required(),
  price: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).optional(),
  total: Joi.number().min(0).optional(),
  productId: Joi.string().uuid().allow(null, ''),
});

export const createInvoiceSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  invoiceNumber: Joi.string().allow('', null),
  items: Joi.array().items(itemSchema).min(1).optional(),
  totalAmount: Joi.number().min(0).optional(),
  paidAmount: Joi.number().min(0).optional(),
  status: Joi.string().valid('paid', 'pending', 'partial', 'hold').optional(),
  notes: Joi.string().allow('', null),
  customerName: Joi.string().allow('', null),
  customerMobile: Joi.string().allow('', null),
  customerAddress: Joi.string().allow('', null),
  gstPercent: Joi.number().optional(),
  gstAmount: Joi.number().optional(),
  grandTotal: Joi.number().optional(),
  balanceDue: Joi.number().optional(),
  type: Joi.string().allow('', null),
  date: Joi.string().allow('', null),
});

export const updateInvoiceSchema = createInvoiceSchema.fork(
    ['customerId'], 
    (schema) => schema.optional()
);

export const addItemSchema = Joi.object({
  productName: Joi.string().min(1).required(),
  quantity: Joi.number().min(0.01).required(),
  unitPrice: Joi.number().min(0).required(),
  productId: Joi.string().uuid().allow(null),
});

export const addPaymentSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  method: Joi.string().min(1).required(),
  reference: Joi.string().allow('', null),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('paid', 'pending', 'partial', 'hold').required(),
});

export const listInvoicesSchema = Joi.object({
  customerId: Joi.string().uuid(),
  status: Joi.string().valid('paid', 'pending', 'partial', 'hold'),
  fromDate: Joi.date().iso(),
  toDate: Joi.date().iso(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
});

export const sendEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const sendWhatsAppSchema = Joi.object({
  mobile: Joi.string().min(10).required(),
});
