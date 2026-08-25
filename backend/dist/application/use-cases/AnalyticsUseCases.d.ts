import { AnalyticsService } from '../services/AnalyticsService.js';
import type { Request } from 'express';
export declare class AnalyticsUseCases {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    recordPageView(req: Request, visitorIdentifier: string): Promise<import("../services/AnalyticsService.js").PageViewResponse>;
    getPublicCount(): Promise<{
        success: boolean;
        data: {
            total_views: number;
            unique_visitors: number;
            last_30_days_views?: number;
            current_year_views?: number;
        };
    }>;
    getAdminReport(fromDate: string, toDate: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
//# sourceMappingURL=AnalyticsUseCases.d.ts.map