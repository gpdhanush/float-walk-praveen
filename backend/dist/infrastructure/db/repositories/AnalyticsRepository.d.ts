export interface PageDailyAnalytics {
    id: number;
    page_path: string;
    analytics_date: string;
    total_views: number;
    unique_views: number;
    created_at: string;
    updated_at: string;
}
export interface AnalyticsPageData {
    page_path: string;
    total_views: number;
    unique_views: number;
    last_viewed_at: string | null;
}
export interface PublicCountResult {
    total_views: number;
    unique_visitors: number;
    last_30_days_views: number;
    current_year_views: number;
}
export interface AdminAnalyticsResult {
    summary: {
        total_views: number;
        unique_visitors: number;
        today_views: number;
        last_7_days_views: number;
        last_30_days_views: number;
    };
    pages: AnalyticsPageData[];
}
export declare class AnalyticsRepository {
    /**
     * Record or increment a page view for a given page and date.
     * Uses atomic upsert to prevent lost updates in concurrent scenarios.
     */
    recordPageView(pagePath: string, analyticsDate: string, incrementTotal?: boolean, incrementUnique?: boolean): Promise<void>;
    /**
     * Check if a visitor has already been recorded for a page within the dedup window.
     * If not, record them and return true (is unique).
     * Uses atomic insert with unique constraint to handle concurrency.
     */
    checkAndRecordDedup(visitorId: string, pagePath: string, deduplicationMinutes: number): Promise<boolean>;
    /**
     * Get public analytics count with configurable scope.
     */
    getPublicCount(scope?: 'lifetime' | '30day' | 'year'): Promise<PublicCountResult>;
    /**
     * Get admin analytics for a date range.
     */
    getPageViewsByDateRange(fromDate: string, toDate: string): Promise<AdminAnalyticsResult>;
    /**
     * Get cached data if exists and not expired.
     */
    getCachedData(cacheKey: string): Promise<unknown | null>;
    /**
     * Set cache data with TTL in seconds.
     */
    setCachedData(cacheKey: string, data: unknown, ttlSeconds: number): Promise<void>;
    /**
     * Clean up expired dedup records.
     */
    cleanupExpiredDedup(): Promise<number>;
    /**
     * Clean up expired cache records.
     */
    cleanupExpiredCache(): Promise<number>;
}
//# sourceMappingURL=AnalyticsRepository.d.ts.map