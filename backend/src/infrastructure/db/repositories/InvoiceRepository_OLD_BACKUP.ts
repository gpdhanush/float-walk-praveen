import type { Invoice, InvoiceItem, Payment } from '../../../domain/entities/index.js';
import type {
  IInvoiceRepository,
  FindInvoicesFilter,
} from '../../../domain/repositories/IInvoiceRepository.js';
import { pool, selectRows } from '../pool.js';
import { mapRow, mapRows } from '../rowMapper.js';
import { randomUUID } from 'crypto';

const statusToDb = {
  pending: 'DRAFT',
  paid: 'COMPLETED',
  partial: 'ADVANCE',
  hold: 'READY',
};

const statusFromDb = {
  DRAFT: 'pending',
  COMPLETED: 'paid',
  ADVANCE: 'partial',
  READY: 'hold',
};

export class InvoiceRepository implements IInvoiceRepository {
  async create(data: Omit<Invoice, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Invoice> {
    const id = data.id ?? randomUUID();
    const total = data.totalAmount ?? 0;
    const paid = data.paidAmount ?? 0;
    const balance = total - paid;
    const dbStatus = statusToDb[data.status as keyof typeof statusToDb] || data.status;

    await pool.execute(
      `INSERT INTO invoices (id, invoice_code, customer_id, status, total, subtotal, gst_percent, gst_amount, advance_paid, balance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.code,
        data.customerId,
        dbStatus,
        total,
        data.subtotal || total,
        data.gstPercent || 0,
        data.gstAmount || 0,
        paid,
        balance,
      ]
    );
    const rows = await selectRows<Record<string, unknown>>(
      `SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`,
      [id]
    );
    const mapped = mapRow<Invoice>(rows[0]);
    if (mapped) {
      mapped.status = (statusFromDb[mapped.status as keyof typeof statusFromDb] as any) || mapped.status;
      mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
      mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
      mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
      mapped.balanceDue = Number(mapped.balanceDue || 0);
    }
    return mapped;
  }

  async findById(id: string): Promise<Invoice | null> {
    const rows = await selectRows<Record<string, unknown>>(
      `SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`,
      [id]
    );
    if (!rows.length) return null;
    const mapped = mapRow<Invoice>(rows[0]);
    if (mapped) {
      mapped.status = (statusFromDb[mapped.status as keyof typeof statusFromDb] as any) || mapped.status;
      mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
      mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
      mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
      mapped.balanceDue = Number(mapped.balanceDue || 0);
    }
    return mapped;
  }

  async findByCode(code: string): Promise<Invoice | null> {
    const rows = await selectRows<Record<string, unknown>>(
      `SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.invoice_code = ?`,
      [code]
    );
    if (!rows.length) return null;
    const mapped = mapRow<Invoice>(rows[0]);
    if (mapped) {
      mapped.status = (statusFromDb[mapped.status as keyof typeof statusFromDb] as any) || mapped.status;
      mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
      mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
      mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
      mapped.balanceDue = Number(mapped.balanceDue || 0);
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
      params.push(statusToDb[filter.status as keyof typeof statusToDb] || filter.status);
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
      `SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       ${where} 
       ORDER BY i.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const invoices = mapRows<Invoice>(rows);
    invoices.forEach(inv => {
        inv.status = (statusFromDb[inv.status as keyof typeof statusFromDb] as any) || inv.status;
        inv.invoiceNumber = inv.invoiceNumber || inv.code;
        inv.grandTotal = Number(inv.grandTotal || inv.totalAmount || 0);
        inv.subtotal = Number(inv.subtotal || 0);
        inv.gstPercent = Number(inv.gstPercent || 0);
        inv.gstAmount = Number(inv.gstAmount || 0);
        inv.advancePaid = Number(inv.advancePaid || inv.paidAmount || 0);
        inv.balanceDue = Number(inv.balanceDue || 0);
    });
    return { invoices, total };
  }

  async update(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      status: 'status',
      totalAmount: 'total',
      paidAmount: 'advance_paid',
      subtotal: 'subtotal',
      gstPercent: 'gst_percent',
      gstAmount: 'gst_amount',
    };
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || k === 'id' || k === 'createdAt' || k === 'deletedAt') continue;
      let col = map[k] ?? k;
      let val = v;
      if (k === 'status') val = statusToDb[v as keyof typeof statusToDb] || v;
      fields.push(`${col} = ?`);
      values.push(val);
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await pool.execute(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
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
    await pool.execute(
      `INSERT INTO invoice_items (id, invoice_id, product_name, quantity, unit_price, total_price, product_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.invoiceId,
        data.productName,
        data.quantity,
        data.unitPrice,
        data.totalPrice,
        data.productId ?? null,
      ]
    );
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM invoice_items WHERE id = ?',
      [id]
    );
    return mapRow<InvoiceItem>(rows[0]);
  }

  async getItems(invoiceId: string): Promise<InvoiceItem[]> {
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT id, invoice_id AS invoiceId, product_name AS productName, quantity, unit_price AS price, total_price AS total, product_id AS productId FROM invoice_items WHERE invoice_id = ? ORDER BY id',
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
      `INSERT INTO payments (id, invoice_id, amount, method, reference)
       VALUES (?, ?, ?, ?, ?)`,
      [id, data.invoiceId, data.amount, data.method, data.reference ?? null]
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
