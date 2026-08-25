import { pool, selectRows } from '../pool.js';
import { mapRow, mapRows } from '../rowMapper.js';
import { randomUUID } from 'crypto';
export class CustomerRepository {
    async create(data) {
        const id = data.id ?? randomUUID();
        await pool.execute(`INSERT INTO customers (id, name, mobile, whatsapp, alt_contact, email, gender, address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            id,
            data.name,
            data.mobile,
            data.whatsapp ?? null,
            data.altContact ?? null,
            data.email ?? null,
            data.gender ?? null,
            data.address ?? null,
            data.notes ?? null,
        ]);
        const rows = await selectRows('SELECT * FROM customers WHERE id = ?', [id]);
        return mapRow(rows[0]);
    }
    async findById(id) {
        const rows = await selectRows('SELECT * FROM customers WHERE id = ?', [id]);
        if (!rows.length)
            return null;
        return mapRow(rows[0]);
    }
    async findByMobile(mobile, excludeId) {
        let sql = 'SELECT * FROM customers WHERE mobile = ?';
        const params = [mobile];
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        const rows = await selectRows(sql, params);
        if (!rows.length)
            return null;
        return mapRow(rows[0]);
    }
    async findMany(filter) {
        const limit = Math.min(filter.limit ?? 10, 100);
        const offset = filter.offset ?? 0;
        let where = 'WHERE 1=1';
        const params = [];
        if (filter.search) {
            where += ' AND (name LIKE ? OR mobile LIKE ? OR email LIKE ?)';
            params.push(`%${filter.search}%`, `%${filter.search}%`, `%${filter.search}%`);
        }
        const countRows = await selectRows(`SELECT COUNT(*) as total FROM customers ${where}`, params);
        const total = countRows[0]?.total ?? 0;
        const rows = await selectRows(`SELECT * FROM customers ${where} ORDER BY name ASC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        const customers = mapRows(rows);
        return { customers, total };
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        const map = {
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
            if (v === undefined || k === 'id' || k === 'createdAt' || k === 'deletedAt')
                continue;
            const col = map[k] ?? k;
            fields.push(`${col} = ?`);
            values.push(v);
        }
        if (fields.length === 0)
            return this.findById(id);
        values.push(id);
        await pool.execute(`UPDATE customers SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
    async softDelete(id) {
        const [result] = await pool.execute('DELETE FROM customers WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}
//# sourceMappingURL=CustomerRepository.js.map