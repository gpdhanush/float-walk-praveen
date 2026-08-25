import type { Request, Response, NextFunction } from 'express';
import { AnalyticsUseCases } from '../../application/use-cases/AnalyticsUseCases.js';
export declare class AnalyticsController {
    private readonly analyticsUseCases;
    constructor(analyticsUseCases: AnalyticsUseCases);
    /**
     * POST /api/analytics/page-view
     * Record a page view from the frontend.
     * Public endpoint, no authentication required.
     */
    recordPageView(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/analytics/page-views/public
     * Get public analytics count.
     * Public endpoint, no authentication required, cached.
     */
    getPublicCount(_req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /api/analytics/page-views
     * Get admin analytics report with date range filtering.
     * Requires authentication and admin role.
     * Query params: from=YYYY-MM-DD, to=YYYY-MM-DD
     */
    getAdminReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=AnalyticsController.d.ts.map