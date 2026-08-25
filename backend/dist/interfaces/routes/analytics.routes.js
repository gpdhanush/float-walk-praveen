import { Router } from 'express';
import { authMiddleware, requireRoles } from '../middlewares/auth.js';
import { pageViewSchema, dateRangeSchema } from '../validators/analytics.validator.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
/**
 * Middleware to validate request body against a Joi schema.
 */
function validateBody(schema) {
    return (req, _res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const messages = error.details
                .map((d) => d.message)
                .join(', ');
            return next(new AppError(ErrorCodes.VALIDATION_ERROR, `Validation failed: ${messages}`, 400));
        }
        next();
    };
}
/**
 * Middleware to validate query parameters against a Joi schema.
 */
function validateQuery(schema) {
    return (req, _res, next) => {
        const { error } = schema.validate(req.query, { abortEarly: false });
        if (error) {
            const messages = error.details
                .map((d) => d.message)
                .join(', ');
            return next(new AppError(ErrorCodes.VALIDATION_ERROR, `Query validation failed: ${messages}`, 400));
        }
        next();
    };
}
export function createAnalyticsRoutes(controller, authService) {
    const router = Router();
    /**
     * POST /api/analytics/page-view
     * Public endpoint - no authentication required
     */
    router.post('/page-view', validateBody(pageViewSchema), controller.recordPageView.bind(controller));
    /**
     * GET /api/analytics/page-views/public
     * Public endpoint - no authentication required, cached response
     */
    router.get('/page-views/public', controller.getPublicCount.bind(controller));
    /**
     * GET /api/analytics/page-views
     * Admin endpoint - requires authentication and admin role
     */
    router.get('/page-views', authMiddleware(authService), requireRoles('admin'), validateQuery(dateRangeSchema), controller.getAdminReport.bind(controller));
    return router;
}
//# sourceMappingURL=analytics.routes.js.map