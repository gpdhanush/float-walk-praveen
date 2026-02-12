import type { Customer } from '../../../domain/entities/Customer.js';
import type {
  ICustomerRepository,
  FindCustomersFilter,
} from '../../../domain/repositories/ICustomerRepository.js';
import { pool, selectRows } from '../pool.js';
import { mapRow, mapRows } from '../rowMapper.js';
import { randomUUID } from 'crypto';

export class CustomerRepository implements ICustomerRepository {
  async create(data: Omit<Customer, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Customer> {
    const id = data.id ?? randomUUID();
    await pool.execute(
      `INSERT INTO customers (id, name, mobile, whatsapp, alt_contact, email, gender, address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.mobile,
        data.whatsapp ?? null,
        data.altContact ?? null,
        data.email ?? null,
        data.gender ?? null,
        data.address ?? null,
        data.notes ?? null,
      ]
    );
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    return mapRow<Customer>(rows[0]);
  }

  async findById(id: string): Promise<Customer | null> {
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM customers WHERE id = ?',
      [id]
    );
    if (!rows.length) return null;
    return mapRow<Customer>(rows[0]);
  }

  async findByMobile(mobile: string, excludeId?: string): Promise<Customer | null> {
    let sql = 'SELECT * FROM customers WHERE mobile = ?';
    const params: unknown[] = [mobile];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    const rows = await selectRows<Record<string, unknown>>(sql, params);
    if (!rows.length) return null;
    return mapRow<Customer>(rows[0]);
  }

  async findMany(filter: FindCustomersFilter): Promise<{ customers: Customer[]; total: number }> {
    const limit = Math.min(filter.limit ?? 10, 100);
    const offset = filter.offset ?? 0;
    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (filter.search) {
      where += ' AND (name LIKE ? OR mobile LIKE ? OR email LIKE ?)';
      params.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
    }

    const countRows = await selectRows<{ total: number }>(
      `SELECT COUNT(*) as total FROM customers ${where}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await selectRows<Record<string, unknown>>(
      `SELECT * FROM customers ${where} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const customers = mapRows<Customer>(rows);
    return { customers, total };
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      name: 'name',
      mobile: 'mobile',
      whatsapp: 'whatsapp',
      altContact: 'alt_contact',
      email: 'email',
      gender: 'gender',
      address: 'address',
      notes: 'notes',
    };
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || k === 'id' || k === 'createdAt' || k === 'deletedAt') continue;
      const col = map[k] ?? k;
      fields.push(`${col} = ?`);
      values.push(v);
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    await pool.execute(
      `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
    return ((result as unknown) as { affectedRows: number }).affectedRows > 0;
  }
}
