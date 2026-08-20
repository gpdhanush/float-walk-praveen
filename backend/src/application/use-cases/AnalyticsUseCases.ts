import { AnalyticsService } from '../services/AnalyticsService.js';
import type { Request } from 'express';

export class AnalyticsUseCases {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async recordPageView(req: Request, visitorIdentifier: string) {
    return this.analyticsService.processPageView(req, visitorIdentifier);
  }

  async getPublicCount() {
    return this.analyticsService.getPublicAnalytics();
  }

  async getAdminReport(fromDate: string, toDate: string) {
    return this.analyticsService.getAdminAnalytics(fromDate, toDate);
  }
}
