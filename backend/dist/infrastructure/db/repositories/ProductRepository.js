import { pool, selectRows } from '../pool.js';
import { mapRow, mapRows } from '../rowMapper.js';
export class ProductRepository {
    async create(data) {
        // Prefer AUTO_INCREMENT id; fall back to explicit id if provided.
        const idValue = data.id ?? null;
        await pool.execute(`INSERT INTO products (id, name, price, description)
       VALUES (?, ?, ?, ?)`, [idValue, data.name, data.price, data.description ?? null]);
        const rows = await selectRows('SELECT id, name, price, description FROM products WHERE id = LAST_INSERT_ID()', []);
        // If table isn't AUTO_INCREMENT and id was provided, LAST_INSERT_ID() may be 0.
        if (!rows.length && data.id != null) {
            const byId = await selectRows('SELECT id, name, price, description FROM products WHERE id = ?', [data.id]);
            return mapRow(byId[0]);
        }
        return mapRow(rows[0]);
    }
    async findById(id) {
        const rows = await selectRows('SELECT id, name, price, description FROM products WHERE id = ?', [id]);
        if (!rows.length)
            return null;
        return mapRow(rows[0]);
    }
    async findMany(filter) {
        const limit = Math.min(filter.limit ?? 100, 200);
        const offset = filter.offset ?? 0;
        let where = 'WHERE 1=1';
        const params = [];
        if (filter.q) {
            where += ' AND (name LIKE ? OR description LIKE ?)';
            const like = `%${filter.q}%`;
            params.push(like, like);
        }
        const countRows = await selectRows(`SELECT COUNT(*) as total FROM products ${where}`, params);
        const total = countRows[0]?.total ?? 0;
        const rows = await selectRows(`SELECT id, name, price, description
       FROM products
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`, [...params, limit, offset]);
        return { products: mapRows(rows), total };
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        const map = {
            name: 'name',
            price: 'price',
            description: 'description',
        };
        for (const [k, v] of Object.entries(data)) {
            if (v === undefined || k === 'id')
                continue;
            const col = map[k] ?? k;
            fields.push(`${col} = ?`);
            values.push(v);
        }
        if (fields.length === 0)
            return this.findById(id);
        values.push(id);
        await pool.execute(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
    async delete(id) {
        const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [
            id,
        ]);
        return result.affectedRows > 0;
    }
}
//# sourceMappingURL=ProductRepository.js.map