import { pool, selectRows } from '../pool.js';

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

export class AnalyticsRepository {
  /**
   * Record or increment a page view for a given page and date.
   * Uses atomic upsert to prevent lost updates in concurrent scenarios.
   */
  async recordPageView(
    pagePath: string,
    analyticsDate: string,
    incrementTotal: boolean = true,
    incrementUnique: boolean = false
  ): Promise<void> {
    const totalIncrement = incrementTotal ? 1 : 0;
    const uniqueIncrement = incrementUnique ? 1 : 0;

    // Atomic upsert: INSERT ON DUPLICATE KEY UPDATE
    await pool.execute(
      `INSERT INTO page_daily_analytics 
       (page_path, analytics_date, total_views, unique_views, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(3), NOW(3))
       ON DUPLICATE KEY UPDATE 
       total_views = total_views + ?,
       unique_views = unique_views + ?,
       updated_at = NOW(3)`,
      [pagePath, analyticsDate, totalIncrement, uniqueIncrement, totalIncrement, uniqueIncrement]
    );
  }

  /**
   * Check if a visitor has already been recorded for a page within the dedup window.
   * If not, record them and return true (is unique).
   * Uses atomic insert with unique constraint to handle concurrency.
   */
  async checkAndRecordDedup(
    visitorId: string,
    pagePath: string,
    deduplicationMinutes: number
  ): Promise<boolean> {
    try {
      // Calculate expiration time
      const expiresAt = new Date(Date.now() + deduplicationMinutes * 60 * 1000);

      // Try to insert the dedup record
      // If it already exists (same visitor_id + page_path), the unique constraint will fail
      await pool.execute(
        `INSERT INTO analytics_visitor_dedup 
         (visitor_id, page_path, expires_at, created_at) 
         VALUES (?, ?, ?, NOW(3))`,
        [visitorId, pagePath, expiresAt]
      );

      // If we got here, the insert succeeded = this is a new/unique visitor
      return true;
    } catch (error: any) {
      // Check if this is a duplicate key error (visitor already has active dedup record)
      if (error.code === 'ER_DUP_ENTRY') {
        // Visitor already recorded in dedup window
        return false;
      }
      // Re-throw any other error
      throw error;
    }
  }

  /**
   * Get public analytics count with configurable scope.
   */
  async getPublicCount(scope: 'lifetime' | '30day' | 'year' = 'lifetime'): Promise<PublicCountResult> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const yearStart = new Date(today);
    yearStart.setMonth(0, 1);
    const yearStartStr = yearStart.toISOString().split('T')[0];

    let whereClause = '1=1';
    if (scope === '30day') {
      whereClause = `analytics_date >= '${thirtyDaysAgoStr}'`;
    } else if (scope === 'year') {
      whereClause = `analytics_date >= '${yearStartStr}'`;
    }

    const rows = await selectRows<{
      total_views: number;
      unique_visitors: number;
    }>(
      `SELECT 
        SUM(total_views) as total_views,
        SUM(unique_views) as unique_visitors
       FROM page_daily_analytics
       WHERE ${whereClause}`,
      []
    );

    const result = rows[0] || { total_views: 0, unique_visitors: 0 };

    // Get 30-day and year totals for inclusion in response
    const last30Rows = await selectRows<{ total_views: number }>(
      `SELECT SUM(total_views) as total_views FROM page_daily_analytics 
       WHERE analytics_date >= ?`,
      [thirtyDaysAgoStr]
    );

    const yearRows = await selectRows<{ total_views: number }>(
      `SELECT SUM(total_views) as total_views FROM page_daily_analytics 
       WHERE analytics_date >= ?`,
      [yearStartStr]
    );

    return {
      total_views: result.total_views || 0,
      unique_visitors: result.unique_visitors || 0,
      last_30_days_views: last30Rows[0]?.total_views || 0,
      current_year_views: yearRows[0]?.total_views || 0,
    };
  }

  /**
   * Get admin analytics for a date range.
   */
  async getPageViewsByDateRange(
    fromDate: string,
    toDate: string
  ): Promise<AdminAnalyticsResult> {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }

    // Prevent excessively large date ranges (max 2 years / 730 days)
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 730) {
      throw new Error('Date range cannot exceed 730 days');
    }

    // Get summary statistics
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Total views for date range
    const totalRows = await selectRows<{
      total_views: number;
      unique_visitors: number;
    }>(
      `SELECT 
        SUM(total_views) as total_views,
        SUM(unique_views) as unique_visitors
       FROM page_daily_analytics
       WHERE analytics_date >= ? AND analytics_date <= ?`,
      [fromDate, toDate]
    );

    const totalData = totalRows[0] || { total_views: 0, unique_visitors: 0 };

    // Today's views
    const todayRows = await selectRows<{ total_views: number }>(
      `SELECT SUM(total_views) as total_views FROM page_daily_analytics 
       WHERE analytics_date = ?`,
      [todayStr]
    );

    // Last 7 days views
    const last7Rows = await selectRows<{ total_views: number }>(
      `SELECT SUM(total_views) as total_views FROM page_daily_analytics 
       WHERE analytics_date >= ? AND analytics_date <= ?`,
      [sevenDaysAgoStr, todayStr]
    );

    // Last 30 days views
    const last30Rows = await selectRows<{ total_views: number }>(
      `SELECT SUM(total_views) as total_views FROM page_daily_analytics 
       WHERE analytics_date >= ? AND analytics_date <= ?`,
      [thirtyDaysAgoStr, todayStr]
    );

    // Per-page breakdown
    const pagesRows = await selectRows<{
      page_path: string;
      total_views: number;
      unique_views: number;
      last_viewed_at: string;
    }>(
      `SELECT 
        page_path,
        SUM(total_views) as total_views,
        SUM(unique_views) as unique_views,
        MAX(analytics_date) as last_viewed_at
       FROM page_daily_analytics
       WHERE analytics_date >= ? AND analytics_date <= ?
       GROUP BY page_path
       ORDER BY total_views DESC`,
      [fromDate, toDate]
    );

    const pages: AnalyticsPageData[] = pagesRows.map((row) => ({
      page_path: row.page_path,
      total_views: row.total_views || 0,
      unique_views: row.unique_views || 0,
      last_viewed_at: row.last_viewed_at ? `${row.last_viewed_at}T00:00:00.000Z` : null,
    }));

    return {
      summary: {
        total_views: totalData.total_views || 0,
        unique_visitors: totalData.unique_visitors || 0,
        today_views: todayRows[0]?.total_views || 0,
        last_7_days_views: last7Rows[0]?.total_views || 0,
        last_30_days_views: last30Rows[0]?.total_views || 0,
      },
      pages,
    };
  }

  /**
   * Get cached data if exists and not expired.
   */
  async getCachedData(cacheKey: string): Promise<unknown | null> {
    const rows = await selectRows<{
      cache_data: string;
      expires_at: string;
    }>(
      `SELECT cache_data, expires_at FROM analytics_cache 
       WHERE cache_key = ? AND expires_at > NOW()`,
      [cacheKey]
    );

    if (!rows.length) {
      return null;
    }

    try {
      return JSON.parse(rows[0].cache_data);
    } catch {
      return null;
    }
  }

  /**
   * Set cache data with TTL in seconds.
   */
  async setCachedData(cacheKey: string, data: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const jsonData = JSON.stringify(data);

    // Insert or replace
    await pool.execute(
      `INSERT INTO analytics_cache (cache_key, cache_data, expires_at, created_at)
       VALUES (?, ?, ?, NOW(3))
       ON DUPLICATE KEY UPDATE
       cache_data = VALUES(cache_data),
       expires_at = VALUES(expires_at),
       created_at = NOW(3)`,
      [cacheKey, jsonData, expiresAt]
    );
  }

  /**
   * Clean up expired dedup records.
   */
  async cleanupExpiredDedup(): Promise<number> {
    const result = await pool.execute(
      `DELETE FROM analytics_visitor_dedup WHERE expires_at <= NOW()`,
      []
    );

    // mysql2 returns [info] where info.affectedRows contains the count
    const affectedRows = (result[1] as any)?.affectedRows ?? 0;
    return affectedRows;
  }

  /**
   * Clean up expired cache records.
   */
  async cleanupExpiredCache(): Promise<number> {
    const result = await pool.execute(
      `DELETE FROM analytics_cache WHERE expires_at <= NOW()`,
      []
    );

    const affectedRows = (result[1] as any)?.affectedRows ?? 0;
    return affectedRows;
  }
}
