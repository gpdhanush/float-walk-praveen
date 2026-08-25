import { pool, selectRows } from '../pool.js';
import { mapRow, mapRows } from '../rowMapper.js';
import { randomUUID } from 'crypto';
export class ExpenseRepository {
    async create(data) {
        const id = data.id ?? randomUUID();
        await pool.execute(`INSERT INTO expenses (id, code, category, amount, description, expense_date)
       VALUES (?, ?, ?, ?, ?, ?)`, [
            id,
            data.code,
            data.category,
            data.amount,
            data.description ?? null,
            data.expenseDate,
        ]);
        const rows = await selectRows('SELECT * FROM expenses WHERE id = ?', [id]);
        return mapRow(rows[0]);
    }
    async findById(id) {
        const rows = await selectRows('SELECT * FROM expenses WHERE id = ?', [id]);
        if (!rows.length)
            return null;
        return mapRow(rows[0]);
    }
    async findMany(filter) {
        const limit = Math.min(filter.limit ?? 10, 100);
        const offset = filter.offset ?? 0;
        let where = 'WHERE 1=1';
        const params = [];
        if (filter.fromDate) {
            where += ' AND expense_date >= ?';
            params.push(filter.fromDate);
        }
        if (filter.toDate) {
            where += ' AND expense_date <= ?';
            params.push(filter.toDate);
        }
        if (filter.category) {
            where += ' AND category = ?';
            params.push(filter.category);
        }
        const countRows = await selectRows(`SELECT COUNT(*) as total FROM expenses ${where}`, params);
        const total = countRows[0]?.total ?? 0;
        const rows = await selectRows(`SELECT * FROM expenses ${where} ORDER BY expense_date DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
        const expenses = mapRows(rows);
        return { expenses, total };
    }
    async update(id, data) {
        const fields = [];
        const values = [];
        const map = {
            category: 'category',
            amount: 'amount',
            description: 'description',
            expenseDate: 'expense_date',
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
        await pool.execute(`UPDATE expenses SET ${fields.join(', ')}, updated_at = NOW(3) WHERE id = ?`, values);
        return this.findById(id);
    }
    async softDelete(id) {
        const [result] = await pool.execute('DELETE FROM expenses WHERE id = ?', [
            id,
        ]);
        return result.affectedRows > 0;
    }
}
//# sourceMappingURL=ExpenseRepository.js.map