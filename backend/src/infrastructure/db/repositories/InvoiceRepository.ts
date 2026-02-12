import type { Invoice, InvoiceItem, Payment } from '../../../domain/entities/index.js';
import type {
  IInvoiceRepository,
  FindInvoicesFilter,
} from '../../../domain/repositories/IInvoiceRepository.js';
import { pool, selectRows } from '../pool.js';
import { mapRow, mapRows } from '../rowMapper.js';
import { randomUUID } from 'crypto';

export class InvoiceRepository implements IInvoiceRepository {
  async create(data: Omit<Invoice, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Invoice> {
    const id = data.id ?? randomUUID();
    const totalAmount = data.totalAmount ?? 0;
    const paidAmount = data.paidAmount ?? 0;

    await pool.execute(
      `INSERT INTO invoices (id, code, customer_id, status, type, total_amount, paid_amount, subtotal, gst_percent, gst_amount, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.code,
        data.customerId,
        data.status,
        data.type || 'Invoice',
        totalAmount,
        paidAmount,
        data.subtotal || 0,
        data.gstPercent || 0,
        data.gstAmount || 0,
        data.notes || null,
        data.createdBy || data.customerId, // Fallback to customer if no user
      ]
    );
    
    const rows = await selectRows<Record<string, unknown>>(
      `SELECT i.id, i.code, i.code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, c.mobile AS customerMobile, c.address AS customerAddress,
              i.status, i.type, i.total_amount AS totalAmount, i.total_amount AS grandTotal, 
              i.paid_amount AS paidAmount, i.paid_amount AS advancePaid,
              (i.total_amount - i.paid_amount) AS balanceDue,
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.notes, i.created_at AS createdAt, DATE(i.created_at) as date,
              i.created_by AS createdBy
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`,
      [id]
    );
    
    const mapped = mapRow<Invoice>(rows[0]);
    if (mapped) {
      mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
      mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
      mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
      mapped.balanceDue = Number(mapped.balanceDue || 0);
      mapped.subtotal = Number(mapped.subtotal || mapped.grandTotal || 0);
      mapped.gstPercent = Number(mapped.gstPercent || 0);
      mapped.gstAmount = Number(mapped.gstAmount || 0);
      mapped.type = mapped.type || 'Invoice';
    }
    return mapped;
  }

  async findById(id: string): Promise<Invoice | null> {
    const rows = await selectRows<Record<string, unknown>>(
      `SELECT i.id, i.code, i.code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, c.mobile AS customerMobile, c.address AS customerAddress,
              i.status, i.type, i.total_amount AS totalAmount, i.total_amount AS grandTotal, 
              i.paid_amount AS paidAmount, i.paid_amount AS advancePaid,
              (i.total_amount - i.paid_amount) AS balanceDue,
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.notes, i.created_at AS createdAt, DATE(i.created_at) as date,
              i.created_by AS createdBy
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`,
      [id]
    );
    
    if (!rows.length) return null;
    
    const mapped = mapRow<Invoice>(rows[0]);
    if (mapped) {
      mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
      mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
      mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
      mapped.balanceDue = Number(mapped.balanceDue || 0);
      mapped.subtotal = Number(mapped.subtotal || mapped.grandTotal || 0);
      mapped.gstPercent = Number(mapped.gstPercent || 0);
      mapped.gstAmount = Number(mapped.gstAmount || 0);
      mapped.type = mapped.type || 'Invoice';
    }
    return mapped;
  }

  async findByCode(code: string): Promise<Invoice | null> {
    const rows = await selectRows<Record<string, unknown>>(
      `SELECT i.id, i.code, i.code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, c.mobile AS customerMobile, c.address AS customerAddress,
              i.status, i.total_amount AS totalAmount, i.total_amount AS grandTotal, 
              i.paid_amount AS paidAmount, i.paid_amount AS advancePaid,
              (i.total_amount - i.paid_amount) AS balanceDue,
              i.notes, i.created_at AS createdAt, DATE(i.created_at) as date,
              i.created_by AS createdBy
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.code = ?`,
      [code]
    );
    
    if (!rows.length) return null;
    
    const mapped = mapRow<Invoice>(rows[0]);
    if (mapped) {
      mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
      mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
      mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
      mapped.balanceDue = Number(mapped.balanceDue || 0);
      mapped.subtotal = mapped.grandTotal;
      mapped.gstPercent = 0;
      mapped.gstAmount = 0;
    }
    return mapped;
  }

  async findMany(filter: FindInvoicesFilter): Promise<{ invoices: Invoice[]; total: number }> {
    const limit = Math.min(filter.limit ?? 10, 100);
    const offset = filter.offset ?? 0;
    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (filter.customerId) {
      where += ' AND i.customer_id = ?';
      params.push(filter.customerId);
    }
    if (filter.status) {
      where += ' AND i.status = ?';
      params.push(filter.status);
    }
    if (filter.fromDate) {
      where += ' AND i.created_at >= ?';
      params.push(filter.fromDate);
    }
    if (filter.toDate) {
      where += ' AND i.created_at <= ?';
      params.push(filter.toDate);
    }

    const countRows = await selectRows<{ total: number }>(
      `SELECT COUNT(*) as total FROM invoices i ${where}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await selectRows<Record<string, unknown>>(
      `SELECT i.id, i.code, i.code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, c.mobile AS customerMobile, c.address AS customerAddress,
              i.status, i.type, i.total_amount AS totalAmount, i.total_amount AS grandTotal, 
              i.paid_amount AS paidAmount, i.paid_amount AS advancePaid,
              (i.total_amount - i.paid_amount) AS balanceDue,
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.notes, i.created_at AS createdAt, DATE(i.created_at) as date,
              i.created_by AS createdBy
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       ${where} 
       ORDER BY i.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    
    const invoices = mapRows<Invoice>(rows);
    invoices.forEach(inv => {
        inv.invoiceNumber = inv.invoiceNumber || inv.code;
        inv.grandTotal = Number(inv.grandTotal || inv.totalAmount || 0);
        inv.advancePaid = Number(inv.advancePaid || inv.paidAmount || 0);
        inv.balanceDue = Number(inv.balanceDue || 0);
        inv.subtotal = Number(inv.subtotal || inv.grandTotal || 0);
        inv.gstPercent = Number(inv.gstPercent || 0);
        inv.gstAmount = Number(inv.gstAmount || 0);
        inv.type = inv.type || 'Invoice';
    });
    
    return { invoices, total };
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      status: 'status',
      totalAmount: 'total_amount',
      paidAmount: 'paid_amount',
      notes: 'notes',
      type: 'type',
      subtotal: 'subtotal',
      gstPercent: 'gst_percent',
      gstAmount: 'gst_amount',
    };
    
    // Fields that should be ignored (not saved to DB)
    const ignoredFields = [
      'id', 'createdAt', 'updatedAt', 'deletedAt', 'createdBy',
      'grandTotal', 'advancePaid', // These are aliases for totalAmount and paidAmount
      'balanceDue', 'items', 'payments', 'customerId', 'customerName',
      'customerMobile', 'customerEmail', 'customerAddress', 'invoiceNumber', 'code', 'date'
    ];
    
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || ignoredFields.includes(k)) continue;
      let col = map[k] ?? k;
      fields.push(`${col} = ?`);
      values.push(v);
    }
    
    console.log('[InvoiceRepository] Updating invoice:', id);
    console.log('[InvoiceRepository] Fields to update:', fields);
    console.log('[InvoiceRepository] Values:', values);
    
    if (fields.length === 0) {
      console.log('[InvoiceRepository] No fields to update, returning current invoice');
      return this.findById(id);
    }
    
    values.push(id);
    const query = `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`;
    console.log('[InvoiceRepository] SQL Query:', query);
    
    await pool.execute(query, values);
    
    console.log('[InvoiceRepository] Update completed, fetching updated invoice');
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);
    return ((result as unknown) as { affectedRows: number }).affectedRows > 0;
  }

  async addItem(
    data: Omit<InvoiceItem, 'createdAt' | 'updatedAt' | 'deletedAt'>
  ): Promise<InvoiceItem> {
    const id = data.id ?? randomUUID();
    
    console.log('[InvoiceRepository] Adding item to invoice:', data.invoiceId);
    console.log('[InvoiceRepository] Item details:', {
      productName: data.productName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice
    });
    
    await pool.execute(
      `INSERT INTO invoice_items (id, invoice_id, product_name, quantity, unit_price, total_price)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.invoiceId,
        data.productName,
        data.quantity,
        data.unitPrice,
        data.totalPrice,
      ]
    );
    
    console.log('[InvoiceRepository] Item added successfully, ID:', id);
    
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM invoice_items WHERE id = ?',
      [id]
    );
    return mapRow<InvoiceItem>(rows[0]);
  }

  async getItems(invoiceId: string): Promise<InvoiceItem[]> {
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT id, invoice_id AS invoiceId, product_name AS productName, quantity, unit_price AS price, total_price AS total FROM invoice_items WHERE invoice_id = ? ORDER BY id',
      [invoiceId]
    );
    return mapRows<InvoiceItem>(rows);
  }

  async removeItem(itemId: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM invoice_items WHERE id = ?', [itemId]);
    return ((result as unknown) as { affectedRows: number }).affectedRows > 0;
  }

  async addPayment(data: Omit<Payment, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Payment> {
    const id = data.id ?? randomUUID();
    await pool.execute(
      `INSERT INTO payments (id, invoice_id, amount, method)
       VALUES (?, ?, ?, ?)`,
      [id, data.invoiceId, data.amount, data.method]
    );
    
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );
    return mapRow<Payment>(rows[0]);
  }

  async getPayments(invoiceId: string): Promise<Payment[]> {
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at',
      [invoiceId]
    );
    return mapRows<Payment>(rows);
  }
}
