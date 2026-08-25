import type { Request } from 'express';
import { validate as validateUUID } from 'uuid';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { AnalyticsRepository } from '../../infrastructure/db/repositories/AnalyticsRepository.js';
import { config } from '../../config/index.js';

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

// Known crawler user agents
const KNOWN_CRAWLERS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'facebookexternalhit',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegram',
  'viber',
  'discordbot',
  'slackbot',
  'curl',
  'wget',
  'scrapy',
  'python-requests',
];

export class AnalyticsService {
  private repository: AnalyticsRepository;
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(repo: AnalyticsRepository) {
    this.repository = repo;
    // Cleanup rate limit map every 5 minutes
    setInterval(() => this.cleanupRateLimit(), 5 * 60 * 1000);
  }

  /**
   * Validate page view request body and structure.
   */
  validatePageViewRequest(body: unknown): PageViewRequest {
    if (!body || typeof body !== 'object') {
      throw new AppError(
        ErrorCodes.BAD_REQUEST,
        'Request body must be valid JSON',
        400
      );
    }

    const req = body as Record<string, unknown>;

    // Validate page_path
    if (!req.page_path || typeof req.page_path !== 'string') {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'page_path is required and must be a string',
        400
      );
    }

    const normalizedPath = this.normalizePagePath(req.page_path);

    // Validate visitor_id
    if (!req.visitor_id || typeof req.visitor_id !== 'string') {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'visitor_id is required and must be a string',
        400
      );
    }

    if (!validateUUID(req.visitor_id)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'visitor_id must be a valid UUID',
        400
      );
    }

    // Validate referrer (optional)
    let normalizedReferrer: string | undefined;
    if (req.referrer) {
      if (typeof req.referrer !== 'string') {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'referrer must be a string',
          400
        );
      }
      normalizedReferrer = this.normalizeReferrer(req.referrer);
    }

    return {
      page_path: normalizedPath,
      visitor_id: req.visitor_id,
      referrer: normalizedReferrer,
    };
  }

  /**
   * Normalize page path: remove query strings, fragments, validate format.
   */
  normalizePagePath(path: string): string {
    if (!path.startsWith('/')) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'page_path must start with /',
        400
      );
    }

    // Remove fragment
    let normalized = path.split('#')[0];

    // Remove query string
    normalized = normalized.split('?')[0];

    // Check for control characters (0-31, 127)
    for (const char of normalized) {
      const code = char.charCodeAt(0);
      if (code < 32 || code === 127) {
        throw new AppError(
          ErrorCodes.VALIDATION_ERROR,
          'page_path contains invalid control characters',
          400
        );
      }
    }

    // Check max length
    if (normalized.length > 512) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'page_path must be 512 characters or less',
        400
      );
    }

    return normalized;
  }

  /**
   * Normalize referrer to origin only (no query params, path, etc).
   */
  normalizeReferrer(referrer: string): string {
    try {
      const url = new URL(referrer);
      return `${url.protocol}//${url.host}`;
    } catch {
      // If invalid URL, reject it silently (don't record referrer)
      return '';
    }
  }

  /**
   * Check if user agent is a known crawler/bot.
   */
  isBotUserAgent(userAgent: string | undefined): boolean {
    if (!userAgent) {
      return false;
    }

    const lowerUA = userAgent.toLowerCase();

    // Check known crawlers list
    for (const crawler of KNOWN_CRAWLERS) {
      if (lowerUA.includes(crawler)) {
        return true;
      }
    }

    // Check for generic bot/crawler/spider keywords
    if (
      lowerUA.includes('bot') ||
      lowerUA.includes('crawler') ||
      lowerUA.includes('spider') ||
      lowerUA.includes('scraper')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check rate limit for a visitor (by IP or visitor ID).
   * Returns true if within limit, false if rate limited.
   */
  checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window
      this.rateLimitMap.set(identifier, {
        count: 1,
        resetTime: now + 60 * 1000, // 1 minute window
      });
      return true;
    }

    // Check if within limit
    if (entry.count >= config.analytics.rateLimitPerMinute) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Process a page view request.
   * Validates, deduplicates, checks for bots, and records in database.
   */
  async processPageView(
    req: Request,
    visitorIdentifier: string
  ): Promise<PageViewResponse> {
    // Check content type
    const contentType = req.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new AppError(
        ErrorCodes.BAD_REQUEST,
        'Content-Type must be application/json',
        400
      );
    }

    // Check body size limit (reasonable request size)
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    if (contentLength > 1024) {
      throw new AppError(
        ErrorCodes.BAD_REQUEST,
        'Request body too large',
        413
      );
    }

    // Rate limit check
    if (!this.checkRateLimit(visitorIdentifier)) {
      throw new AppError(
        ErrorCodes.BAD_REQUEST,
        'Too many requests. Please try again later.',
        429
      );
    }

    // Validate request body
    const pageView = this.validatePageViewRequest(req.body);

    // Check for bot user agent
    const userAgent = req.get('user-agent');
    if (this.isBotUserAgent(userAgent)) {
      // Don't record bot traffic
      return {
        success: true,
        data: { recorded: false },
      };
    }

    // Track admin traffic if disabled
    if (!config.analytics.trackAdmin && this.isAdminPath(pageView.page_path)) {
      return {
        success: true,
        data: { recorded: false },
      };
    }

    // Get current UTC date (YYYY-MM-DD)
    const now = new Date();
    const analyticsDate = now.toISOString().split('T')[0];

    // Check deduplication
    const isUnique = await this.repository.checkAndRecordDedup(
      pageView.visitor_id,
      pageView.page_path,
      config.analytics.deduplicationMinutes
    );

    // Record page view in analytics
    try {
      await this.repository.recordPageView(
        pageView.page_path,
        analyticsDate,
        true, // Always increment total
        isUnique // Only increment unique if first time in window
      );
    } catch (error) {
      console.error('[AnalyticsService] Error recording page view:', error);
      throw new AppError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to record page view',
        500
      );
    }

    return {
      success: true,
      data: { recorded: true },
    };
  }

  /**
   * Get public analytics data (no admin secrets exposed).
   */
  async getPublicAnalytics(): Promise<{
    success: boolean;
    data: {
      total_views: number;
      unique_visitors: number;
      today_views?: number;
      last_30_days_views?: number;
      current_year_views?: number;
    };
  }> {
    if (!config.analytics.publicCountEnabled) {
      return {
        success: true,
        data: {
          total_views: 0,
          unique_visitors: 0,
          today_views: 0,
          last_30_days_views: 0,
          current_year_views: 0,
        },
      };
    }

    // Check cache first
    const cacheKey = 'public_analytics_lifetime';
    const cached = await this.repository.getCachedData(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached as any,
      };
    }

    // Get fresh data
    const result = await this.repository.getPublicCount('lifetime');

    // Cache for configured TTL
    await this.repository.setCachedData(cacheKey, result, config.analytics.cacheTtlSeconds);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Get admin analytics for date range (requires auth).
   */
  async getAdminAnalytics(fromDate: string, toDate: string): Promise<{
    success: boolean;
    data: any;
  }> {
    // Validate dates
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'Dates must be in YYYY-MM-DD format',
        400
      );
    }

    if (new Date(fromDate) > new Date(toDate)) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        'fromDate must be before or equal to toDate',
        400
      );
    }

    const result = await this.repository.getPageViewsByDateRange(fromDate, toDate);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * Check if path is an admin path.
   */
  private isAdminPath(path: string): boolean {
    const adminPrefixes = ['/admin', '/api/admin', '/web-admin'];
    return adminPrefixes.some((prefix) => path.startsWith(prefix));
  }

  /**
   * Cleanup rate limit map (remove expired entries).
   */
  private cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}
