import type { Request, Response, NextFunction } from 'express';
import { AnalyticsUseCases } from '../../application/use-cases/AnalyticsUseCases.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';

export class AnalyticsController {
  constructor(private readonly analyticsUseCases: AnalyticsUseCases) {}

  /**
   * POST /api/analytics/page-view
   * Record a page view from the frontend.
   * Public endpoint, no authentication required.
   */
  async recordPageView(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get visitor identifier (IP address or visitor ID)
      const visitorIdentifier = req.ip || req.socket.remoteAddress || 'unknown';

      const result = await this.analyticsUseCases.recordPageView(req, visitorIdentifier);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/page-views/public
   * Get public analytics count.
   * Public endpoint, no authentication required, cached.
   */
  async getPublicCount(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.analyticsUseCases.getPublicCount();
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/page-views
   * Get admin analytics report with date range filtering.
   * Requires authentication and admin role.
   * Query params: from=YYYY-MM-DD, to=YYYY-MM-DD
   */
  async getAdminReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;

      if (!from || !to) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'Query parameters "from" and "to" are required (YYYY-MM-DD format)',
          400
        );
      }

      const result = await this.analyticsUseCases.getAdminReport(from, to);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
