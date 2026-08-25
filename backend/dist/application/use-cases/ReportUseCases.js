import { selectRows } from '../../infrastructure/db/pool.js';
function toDate(d) {
    if (d == null)
        return undefined;
    return typeof d === 'string' ? new Date(d) : d;
}
export class ReportUseCases {
    async salesReport(range) {
        let where = 'WHERE deleted_at IS NULL';
        const params = [];
        const from = toDate(range.fromDate);
        const to = toDate(range.toDate);
        if (from) {
            where += ' AND created_at >= ?';
            params.push(from);
        }
        if (to) {
            where += ' AND created_at <= ?';
            params.push(to);
        }
        const totals = await selectRows(`SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count FROM invoices ${where}`, params);
        const t = totals[0];
        const byStatus = await selectRows(`SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total FROM invoices ${where} GROUP BY status`, params);
        return {
            totalSales: Number(t?.total ?? 0),
            totalInvoices: Number(t?.count ?? 0),
            byStatus: byStatus.map((r) => ({
                status: r.status,
                count: Number(r.count),
                total: Number(r.total),
            })),
        };
    }
    async expensesReport(range) {
        let where = 'WHERE deleted_at IS NULL';
        const params = [];
        const from = toDate(range.fromDate);
        const to = toDate(range.toDate);
        if (from) {
            where += ' AND expense_date >= ?';
            params.push(from);
        }
        if (to) {
            where += ' AND expense_date <= ?';
            params.push(to);
        }
        const totals = await selectRows(`SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses ${where}`, params);
        const t = totals[0];
        const byCategory = await selectRows(`SELECT category, COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses ${where} GROUP BY category`, params);
        return {
            total: Number(t?.total ?? 0),
            count: Number(t?.count ?? 0),
            byCategory: byCategory.map((r) => ({
                category: r.category,
                total: Number(r.total),
                count: Number(r.count),
            })),
        };
    }
    async purchasesReport(range) {
        let where = 'WHERE deleted_at IS NULL';
        const params = [];
        const from = toDate(range.fromDate);
        const to = toDate(range.toDate);
        if (from) {
            where += ' AND purchase_date >= ?';
            params.push(from);
        }
        if (to) {
            where += ' AND purchase_date <= ?';
            params.push(to);
        }
        const rows = await selectRows(`SELECT COALESCE(SUM(total_amount), 0) as total, COUNT(*) as count FROM purchases ${where}`, params);
        const r = rows[0];
        return {
            total: Number(r?.total ?? 0),
            count: Number(r?.count ?? 0),
        };
    }
}
//# sourceMappingURL=ReportUseCases.js.map