import { reportUseCases } from '../../container.js';
export async function salesReport(req, res, next) {
    try {
        const data = await reportUseCases.salesReport(req.query);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
}
export async function expensesReport(req, res, next) {
    try {
        const data = await reportUseCases.expensesReport(req.query);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
}
export async function purchasesReport(req, res, next) {
    try {
        const data = await reportUseCases.purchasesReport(req.query);
        res.json({ success: true, data });
    }
    catch (e) {
        next(e);
    }
}
//# sourceMappingURL=ReportController.js.map