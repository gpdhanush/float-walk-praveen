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
export class InvoiceRepository {
    async create(data) {
        const id = data.id ?? randomUUID();
        const total = data.totalAmount ?? 0;
        const paid = data.paidAmount ?? 0;
        const balance = total - paid;
        const dbStatus = statusToDb[data.status] || data.status;
        await pool.execute(`INSERT INTO invoices (id, invoice_code, customer_id, status, total, subtotal, gst_percent, gst_amount, advance_paid, balance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ]);
        const rows = await selectRows(`SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`, [id]);
        const mapped = mapRow(rows[0]);
        if (mapped) {
            mapped.status = statusFromDb[mapped.status] || mapped.status;
            mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
            mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
            mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
            mapped.balanceDue = Number(mapped.balanceDue || 0);
        }
        return mapped;
    }
    async findById(id) {
        const rows = await selectRows(`SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.id = ?`, [id]);
        if (!rows.length)
            return null;
        const mapped = mapRow(rows[0]);
        if (mapped) {
            mapped.status = statusFromDb[mapped.status] || mapped.status;
            mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
            mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
            mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
            mapped.balanceDue = Number(mapped.balanceDue || 0);
        }
        return mapped;
    }
    async findByCode(code) {
        const rows = await selectRows(`SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       WHERE i.invoice_code = ?`, [code]);
        if (!rows.length)
            return null;
        const mapped = mapRow(rows[0]);
        if (mapped) {
            mapped.status = statusFromDb[mapped.status] || mapped.status;
            mapped.invoiceNumber = mapped.invoiceNumber || mapped.code;
            mapped.grandTotal = Number(mapped.grandTotal || mapped.totalAmount || 0);
            mapped.advancePaid = Number(mapped.advancePaid || mapped.paidAmount || 0);
            mapped.balanceDue = Number(mapped.balanceDue || 0);
        }
        return mapped;
    }
    async findMany(filter) {
        const limit = Math.min(filter.limit ?? 10, 100);
        const offset = filter.offset ?? 0;
        let where = 'WHERE 1=1';
        const params = [];
        if (filter.customerId) {
            where += ' AND i.customer_id = ?';
            params.push(filter.customerId);
        }
        if (filter.status) {
            where += ' AND i.status = ?';
            params.push(statusToDb[filter.status] || filter.status);
        }
        if (filter.fromDate) {
            where += ' AND i.created_at >= ?';
            params.push(filter.fromDate);
        }
        if (filter.toDate) {
            where += ' AND i.created_at <= ?';
            params.push(filter.toDate);
        }
        const countRows = await selectRows(`SELECT COUNT(*) as total FROM invoices i ${where}`, params);
        const total = countRows[0]?.total ?? 0;
        const rows = await selectRows(`SELECT i.id, i.invoice_code AS code, i.invoice_code AS invoiceNumber, i.customer_id AS customerId, 
              c.name AS customerName, i.status, i.total AS totalAmount, i.total AS grandTotal, 
              i.subtotal, i.gst_percent AS gstPercent, i.gst_amount AS gstAmount,
              i.advance_paid AS paidAmount, i.advance_paid AS advancePaid, i.balance AS balanceDue,
              i.created_at AS createdAt, DATE(i.created_at) as date
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.id
       ${where} 
       ORDER BY i.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        const invoices = mapRows(rows);
        invoices.forEach(inv => {
            inv.status = statusFromDb[inv.status] || inv.status;
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
    async update(id, data) {
        const fields = [];
        const values = [];
        const map = {
            status: 'status',
            totalAmount: 'total',
            paidAmount: 'advance_paid',
            subtotal: 'subtotal',
            gstPercent: 'gst_percent',
            gstAmount: 'gst_amount',
        };
        for (const [k, v] of Object.entries(data)) {
            if (v === undefined || k === 'id' || k === 'createdAt' || k === 'deletedAt')
                continue;
            let col = map[k] ?? k;
            let val = v;
            if (k === 'status')
                val = statusToDb[v] || v;
            fields.push(`${col} = ?`);
            values.push(val);
        }
        if (fields.length === 0)
            return this.findById(id);
        values.push(id);
        await pool.execute(`UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
    async softDelete(id) {
        const [result] = await pool.execute('DELETE FROM invoices WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    async addItem(data) {
        const id = data.id ?? randomUUID();
        await pool.execute(`INSERT INTO invoice_items (id, invoice_id, product_name, quantity, unit_price, total_price, product_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            id,
            data.invoiceId,
            data.productName,
            data.quantity,
            data.unitPrice,
            data.totalPrice,
            data.productId ?? null,
        ]);
        const rows = await selectRows('SELECT * FROM invoice_items WHERE id = ?', [id]);
        return mapRow(rows[0]);
    }
    async getItems(invoiceId) {
        const rows = await selectRows('SELECT id, invoice_id AS invoiceId, product_name AS productName, quantity, unit_price AS price, total_price AS total, product_id AS productId FROM invoice_items WHERE invoice_id = ? ORDER BY id', [invoiceId]);
        return mapRows(rows);
    }
    async removeItem(itemId) {
        const [result] = await pool.execute('DELETE FROM invoice_items WHERE id = ?', [itemId]);
        return result.affectedRows > 0;
    }
    async addPayment(data) {
        const id = data.id ?? randomUUID();
        await pool.execute(`INSERT INTO payments (id, invoice_id, amount, method, reference)
       VALUES (?, ?, ?, ?, ?)`, [id, data.invoiceId, data.amount, data.method, data.reference ?? null]);
        const rows = await selectRows('SELECT * FROM payments WHERE id = ?', [id]);
        return mapRow(rows[0]);
    }
    async getPayments(invoiceId) {
        const rows = await selectRows('SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at', [invoiceId]);
        return mapRows(rows);
    }
}
//# sourceMappingURL=InvoiceRepository_OLD_BACKUP.js.map