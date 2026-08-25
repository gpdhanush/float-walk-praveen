import { AppError, ErrorCodes } from '../../utils/errors.js';
import { webAdminRepository } from '../../container.js';
import { webResourceDefinitions } from '../../infrastructure/db/repositories/WebAdminRepository.js';
function resource(req) {
    const value = req.params.resource;
    if (!webResourceDefinitions[value])
        throw new AppError(ErrorCodes.NOT_FOUND, 'Web resource not found', 404);
    return value;
}
function id(req) {
    const value = Number(req.params.id);
    if (!Number.isInteger(value) || value < 1)
        throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid record id', 400);
    return value;
}
export async function list(req, res, next) {
    try {
        const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
        const result = await webAdminRepository.list(resource(req), limit, offset);
        res.json({ success: true, data: result.rows, meta: { total: result.total, limit, offset } });
    }
    catch (error) {
        next(error);
    }
}
export async function get(req, res, next) {
    try {
        const record = await webAdminRepository.getById(resource(req), id(req));
        if (!record) {
            res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Web record not found' });
            return;
        }
        res.json({ success: true, data: record });
    }
    catch (error) {
        next(error);
    }
}
export async function create(req, res, next) {
    try {
        res.status(201).json({ success: true, data: await webAdminRepository.create(resource(req), req.body) });
    }
    catch (error) {
        next(error);
    }
}
export async function update(req, res, next) {
    try {
        const record = await webAdminRepository.update(resource(req), id(req), req.body);
        if (!record) {
            res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Web record not found' });
            return;
        }
        res.json({ success: true, data: record });
    }
    catch (error) {
        next(error);
    }
}
export async function remove(req, res, next) {
    try {
        if (!await webAdminRepository.delete(resource(req), id(req))) {
            res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Web record not found' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=WebAdminController.js.map