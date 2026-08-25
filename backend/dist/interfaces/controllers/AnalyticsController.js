import { AppError, ErrorCodes } from '../../utils/errors.js';
export class AnalyticsController {
    analyticsUseCases;
    constructor(analyticsUseCases) {
        this.analyticsUseCases = analyticsUseCases;
    }
    /**
     * POST /api/analytics/page-view
     * Record a page view from the frontend.
     * Public endpoint, no authentication required.
     */
    async recordPageView(req, res, next) {
        try {
            // Get visitor identifier (IP address or visitor ID)
            const visitorIdentifier = req.ip || req.socket.remoteAddress || 'unknown';
            const result = await this.analyticsUseCases.recordPageView(req, visitorIdentifier);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/analytics/page-views/public
     * Get public analytics count.
     * Public endpoint, no authentication required, cached.
     */
    async getPublicCount(_req, res, next) {
        try {
            const result = await this.analyticsUseCases.getPublicCount();
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/analytics/page-views
     * Get admin analytics report with date range filtering.
     * Requires authentication and admin role.
     * Query params: from=YYYY-MM-DD, to=YYYY-MM-DD
     */
    async getAdminReport(req, res, next) {
        try {
            const from = req.query.from;
            const to = req.query.to;
            if (!from || !to) {
                throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Query parameters "from" and "to" are required (YYYY-MM-DD format)', 400);
            }
            const result = await this.analyticsUseCases.getAdminReport(from, to);
            res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
//# sourceMappingURL=AnalyticsController.js.map