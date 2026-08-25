import { webAdminRepository, webBusinessSettingsRepository } from '../../container.js';
const publicReadResources = new Set(['testimonials', 'gallery', 'services']);
const publicSubmissionResources = new Set(['enquiries', 'appointments']);
function resource(req) {
    const value = req.params.resource;
    return value;
}
export async function list(req, res, next) {
    try {
        const value = resource(req);
        if (!value || !publicReadResources.has(value)) {
            res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Public resource not found' });
            return;
        }
        const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 200);
        const result = await webAdminRepository.list(value, limit, Math.max(Number(req.query.offset) || 0, 0));
        let rows = result.rows;
        if (value === 'testimonials')
            rows = rows.filter((row) => row.is_published === true || row.is_published === 1 || row.is_published === '1');
        if (value === 'gallery')
            rows = rows.filter((row) => row.is_active === true || row.is_active === 1 || row.is_active === '1');
        if (value === 'services')
            rows = rows.filter((row) => row.is_active === true || row.is_active === 1 || row.is_active === '1');
        res.json({ success: true, data: rows, meta: { total: rows.length, limit, offset: 0 } });
    }
    catch (error) {
        next(error);
    }
}
export async function createSubmission(req, res, next) {
    try {
        const value = resource(req);
        if (!value || !publicSubmissionResources.has(value)) {
            res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Public submission not found' });
            return;
        }
        const record = await webAdminRepository.create(value, req.body);
        res.status(201).json({ success: true, data: record });
    }
    catch (error) {
        next(error);
    }
}
export async function status(_req, res, next) {
    try {
        res.json({ success: true, data: await webBusinessSettingsRepository.getStatus() });
    }
    catch (error) {
        next(error);
    }
}
export async function hours(_req, res, next) {
    try {
        res.json({ success: true, data: await webBusinessSettingsRepository.getHours() });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=WebPublicController.js.map