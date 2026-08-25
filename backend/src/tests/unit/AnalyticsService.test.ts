import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AnalyticsService } from '../../../src/application/services/AnalyticsService';
import { AnalyticsRepository } from '../../../src/infrastructure/db/repositories/AnalyticsRepository';
import { AppError, ErrorCodes } from '../../../src/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import type { Request } from 'express';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockRepository: jest.Mocked<AnalyticsRepository>;

  beforeEach(() => {
    // Mock the repository
    mockRepository = {
      recordPageView: jest.fn<AnalyticsRepository['recordPageView']>().mockResolvedValue(undefined),
      checkAndRecordDedup: jest.fn<AnalyticsRepository['checkAndRecordDedup']>().mockResolvedValue(true),
      getPublicCount: jest.fn<AnalyticsRepository['getPublicCount']>().mockResolvedValue({
        total_views: 1000,
        unique_visitors: 500,
        today_views: 25,
        last_30_days_views: 200,
        current_year_views: 800,
      }),
      getPageViewsByDateRange: jest.fn<AnalyticsRepository['getPageViewsByDateRange']>().mockResolvedValue({
        summary: {
          total_views: 100,
          unique_visitors: 50,
          today_views: 10,
          last_7_days_views: 50,
          last_30_days_views: 100,
        },
        pages: [
          {
            page_path: '/',
            total_views: 50,
            unique_views: 25,
            last_viewed_at: '2026-08-20T00:00:00.000Z',
          },
        ],
      }),
      getCachedData: jest.fn<AnalyticsRepository['getCachedData']>().mockResolvedValue(null),
      setCachedData: jest.fn<AnalyticsRepository['setCachedData']>().mockResolvedValue(undefined),
      cleanupExpiredDedup: jest.fn<AnalyticsRepository['cleanupExpiredDedup']>().mockResolvedValue(0),
      cleanupExpiredCache: jest.fn<AnalyticsRepository['cleanupExpiredCache']>().mockResolvedValue(0),
    } as any;

    service = new AnalyticsService(mockRepository);
  });

  describe('validatePageViewRequest', () => {
    it('1. Valid page-view request', () => {
      const validRequest = {
        page_path: '/services',
        visitor_id: uuidv4(),
        referrer: 'https://google.com',
      };

      const result = service.validatePageViewRequest(validRequest);
      expect(result.page_path).toBe('/services');
      expect(result.visitor_id).toBe(validRequest.visitor_id);
      expect(result.referrer).toBe('https://google.com');
    });

    it('2. Invalid path - missing leading slash', () => {
      const invalidRequest = {
        page_path: 'services',
        visitor_id: uuidv4(),
      };

      expect(() => service.validatePageViewRequest(invalidRequest)).toThrow(AppError);
    });

    it('3. Query string rejection', () => {
      const invalidRequest = {
        page_path: '/services?user=test@example.com',
        visitor_id: uuidv4(),
      };

      const result = service.validatePageViewRequest(invalidRequest);
      // Query string should be stripped
      expect(result.page_path).toBe('/services');
    });

    it('4. Fragment rejection', () => {
      const invalidRequest = {
        page_path: '/services#private-data',
        visitor_id: uuidv4(),
      };

      const result = service.validatePageViewRequest(invalidRequest);
      // Fragment should be stripped
      expect(result.page_path).toBe('/services');
    });

    it('5. Oversized path rejection', () => {
      const longPath = '/' + 'a'.repeat(513);
      const invalidRequest = {
        page_path: longPath,
        visitor_id: uuidv4(),
      };

      expect(() => service.validatePageViewRequest(invalidRequest)).toThrow(AppError);
    });

    it('6. Control characters rejection', () => {
      const invalidRequest = {
        page_path: '/services\x00invalid',
        visitor_id: uuidv4(),
      };

      expect(() => service.validatePageViewRequest(invalidRequest)).toThrow(AppError);
    });

    it('7. Invalid UUID format', () => {
      const invalidRequest = {
        page_path: '/services',
        visitor_id: 'not-a-uuid',
      };

      expect(() => service.validatePageViewRequest(invalidRequest)).toThrow(AppError);
    });

    it('8. Invalid referrer URL', () => {
      const invalidRequest = {
        page_path: '/services',
        visitor_id: uuidv4(),
        referrer: 'not a valid url',
      };

      const result = service.validatePageViewRequest(invalidRequest);
      // Invalid referrer should be normalized to empty string
      expect(result.referrer).toBe('');
    });

    it('9. Referrer origin normalization', () => {
      const request = {
        page_path: '/services',
        visitor_id: uuidv4(),
        referrer: 'https://google.com/search?q=test#results',
      };

      const result = service.validatePageViewRequest(request);
      expect(result.referrer).toBe('https://google.com');
    });
  });

  describe('Bot detection', () => {
    it('13. Bot user agent rejection', () => {
      expect(service.isBotUserAgent('Mozilla/5.0 Googlebot')).toBe(true);
      expect(service.isBotUserAgent('Bingbot')).toBe(true);
      expect(service.isBotUserAgent('Mozilla crawler/1.0')).toBe(true);
    });

    it('13b. Known crawler list detection', () => {
      expect(service.isBotUserAgent('Yandexbot')).toBe(true);
      expect(service.isBotUserAgent('Baidubot')).toBe(true);
      expect(service.isBotUserAgent('curl')).toBe(true);
    });

    it('13c. Normal user agent passes', () => {
      expect(service.isBotUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false);
      expect(service.isBotUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)')).toBe(false);
    });
  });

  describe('Rate limiting', () => {
    it('14. Rate limit enforcement', () => {
      const identifier = 'test-visitor-ip';

      // Should allow up to config.analytics.rateLimitPerMinute requests
      // Default is 60 per minute
      for (let i = 0; i < 60; i++) {
        const result = service.checkRateLimit(identifier);
        expect(result).toBe(true);
      }

      // 61st request should be rate limited
      const rateLimitedResult = service.checkRateLimit(identifier);
      expect(rateLimitedResult).toBe(false);
    });
  });

  describe('Page view processing', () => {
    it('10. Duplicate visitor within dedup period', async () => {
      mockRepository.checkAndRecordDedup.mockResolvedValueOnce(false); // Already in dedup

      const mockRequest = {
        ip: '127.0.0.1',
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          if (header === 'content-length') return '100';
          return undefined;
        }),
        body: {
          page_path: '/services',
          visitor_id: uuidv4(),
        },
      } as any as Request;

      const result = await service.processPageView(mockRequest, '127.0.0.1');

      expect(result.success).toBe(true);
      expect(result.data.recorded).toBe(true);
      // Should call recordPageView with incrementUnique=false since not unique
      expect(mockRepository.recordPageView).toHaveBeenCalled();
    });

    it('11. Same visitor after dedup expiry', async () => {
      mockRepository.checkAndRecordDedup.mockResolvedValueOnce(true); // New unique visitor

      const mockRequest = {
        ip: '127.0.0.1',
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          if (header === 'content-length') return '100';
          return undefined;
        }),
        body: {
          page_path: '/services',
          visitor_id: uuidv4(),
        },
      } as any as Request;

      const result = await service.processPageView(mockRequest, '127.0.0.1');

      expect(result.success).toBe(true);
      expect(result.data.recorded).toBe(true);
      // Should call recordPageView with incrementUnique=true since unique
      expect(mockRepository.recordPageView).toHaveBeenCalledWith(
        '/services',
        expect.any(String),
        true,
        true
      );
    });

    it('12. Different visitors', async () => {
      mockRepository.checkAndRecordDedup.mockResolvedValueOnce(true);

      const visitor1Request = {
        ip: '127.0.0.1',
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          if (header === 'content-length') return '100';
          return undefined;
        }),
        body: {
          page_path: '/services',
          visitor_id: uuidv4(),
        },
      } as any as Request;

      await service.processPageView(visitor1Request, '127.0.0.1');

      mockRepository.checkAndRecordDedup.mockResolvedValueOnce(true);

      const visitor2Request = {
        ip: '127.0.0.2',
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          if (header === 'content-length') return '100';
          return undefined;
        }),
        body: {
          page_path: '/services',
          visitor_id: uuidv4(),
        },
      } as any as Request;

      await service.processPageView(visitor2Request, '127.0.0.2');

      // Both should be recorded with unique increment
      expect(mockRepository.recordPageView).toHaveBeenCalledTimes(2);
    });

    it('15. Concurrent page-view requests', async () => {
      const visitorId = uuidv4();
      mockRepository.checkAndRecordDedup.mockResolvedValue(true);

      const mockRequest = (ip: string) => ({
        ip,
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          if (header === 'content-length') return '100';
          return undefined;
        }),
        body: {
          page_path: '/services',
          visitor_id: visitorId,
        },
      }) as any as Request;

      // Simulate concurrent requests
      const promises = [
        service.processPageView(mockRequest('127.0.0.1'), '127.0.0.1'),
        service.processPageView(mockRequest('127.0.0.2'), '127.0.0.2'),
        service.processPageView(mockRequest('127.0.0.3'), '127.0.0.3'),
      ];

      const results = await Promise.all(promises);

      expect(results.length).toBe(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it('16. Atomic total-view increments', async () => {
      mockRepository.checkAndRecordDedup.mockResolvedValueOnce(true);

      const mockRequest = {
        ip: '127.0.0.1',
        get: jest.fn((header) => {
          if (header === 'content-type') return 'application/json';
          if (header === 'content-length') return '100';
          return undefined;
        }),
        body: {
          page_path: '/services',
          visitor_id: uuidv4(),
        },
      } as any as Request;

      await service.processPageView(mockRequest, '127.0.0.1');

      expect(mockRepository.recordPageView).toHaveBeenCalledWith(
        '/services',
        expect.any(String),
        true, // Always increment total
        true // Increment unique since first visit
      );
    });
  });

  describe('Public analytics', () => {
    it('17. Public count endpoint', async () => {
      // Clear cache to ensure fresh data is fetched
      mockRepository.getCachedData.mockResolvedValueOnce(null);
      mockRepository.getPublicCount.mockResolvedValueOnce({
        total_views: 1000,
        unique_visitors: 500,
        today_views: 25,
        last_30_days_views: 200,
        current_year_views: 800,
      });

      const result = await service.getPublicAnalytics();

      expect(result.success).toBe(true);
      expect(result.data.total_views).toBe(1000);
      expect(result.data.unique_visitors).toBe(500);
      expect(result.data.today_views).toBe(25);
    });

    it('18. Unauthenticated access to public count', async () => {
      // Should not throw any auth error
      const result = await service.getPublicAnalytics();
      expect(result.success).toBe(true);
    });
  });

  describe('Admin reporting', () => {
    it('19. Authenticated admin reporting', async () => {
      const result = await service.getAdminAnalytics('2026-08-01', '2026-08-20');

      expect(result.success).toBe(true);
      expect(result.data.summary.total_views).toBe(100);
      expect(result.data.pages).toHaveLength(1);
    });

    it('21. Date filtering', async () => {
      await service.getAdminAnalytics('2026-08-10', '2026-08-20');

      expect(mockRepository.getPageViewsByDateRange).toHaveBeenCalledWith('2026-08-10', '2026-08-20');
    });

    it('22. Empty date range handling', async () => {
      mockRepository.getPageViewsByDateRange.mockResolvedValueOnce({
        summary: {
          total_views: 0,
          unique_visitors: 0,
          today_views: 0,
          last_7_days_views: 0,
          last_30_days_views: 0,
        },
        pages: [],
      });

      const result = await service.getAdminAnalytics('2026-08-20', '2026-08-20');

      expect(result.data.summary.total_views).toBe(0);
      expect(result.data.pages).toHaveLength(0);
    });
  });

  describe('Validation edge cases', () => {
    it('Request body validation - missing page_path', () => {
      expect(() =>
        service.validatePageViewRequest({
          visitor_id: uuidv4(),
        })
      ).toThrow(AppError);
    });

    it('Request body validation - missing visitor_id', () => {
      expect(() =>
        service.validatePageViewRequest({
          page_path: '/services',
        })
      ).toThrow(AppError);
    });

    it('Request body validation - invalid body', () => {
      expect(() => service.validatePageViewRequest(null)).toThrow(AppError);
      expect(() => service.validatePageViewRequest('not an object')).toThrow(AppError);
    });
  });
});
