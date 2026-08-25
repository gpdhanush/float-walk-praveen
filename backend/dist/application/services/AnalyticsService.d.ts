import type { Request } from 'express';
import { AnalyticsRepository } from '../../infrastructure/db/repositories/AnalyticsRepository.js';
export interface PageViewRequest {
    page_path: string;
    visitor_id: string;
    referrer?: string;
}
export interface PageViewResponse {
    success: boolean;
    data: {
        recorded: boolean;
    };
}
export declare class AnalyticsService {
    private repository;
    private rateLimitMap;
    constructor(repo: AnalyticsRepository);
    /**
     * Validate page view request body and structure.
     */
    validatePageViewRequest(body: unknown): PageViewRequest;
    /**
     * Normalize page path: remove query strings, fragments, validate format.
     */
    normalizePagePath(path: string): string;
    /**
     * Normalize referrer to origin only (no query params, path, etc).
     */
    normalizeReferrer(referrer: string): string;
    /**
     * Check if user agent is a known crawler/bot.
     */
    isBotUserAgent(userAgent: string | undefined): boolean;
    /**
     * Check rate limit for a visitor (by IP or visitor ID).
     * Returns true if within limit, false if rate limited.
     */
    checkRateLimit(identifier: string): boolean;
    /**
     * Process a page view request.
     * Validates, deduplicates, checks for bots, and records in database.
     */
    processPageView(req: Request, visitorIdentifier: string): Promise<PageViewResponse>;
    /**
     * Get public analytics data (no admin secrets exposed).
     */
    getPublicAnalytics(): Promise<{
        success: boolean;
        data: {
            total_views: number;
            unique_visitors: number;
            last_30_days_views?: number;
            current_year_views?: number;
        };
    }>;
    /**
     * Get admin analytics for date range (requires auth).
     */
    getAdminAnalytics(fromDate: string, toDate: string): Promise<{
        success: boolean;
        data: any;
    }>;
    /**
     * Check if path is an admin path.
     */
    private isAdminPath;
    /**
     * Cleanup rate limit map (remove expired entries).
     */
    private cleanupRateLimit;
}
//# sourceMappingURL=AnalyticsService.d.ts.map