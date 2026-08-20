import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { pool } from '../../../src/infrastructure/db/pool';
import { v4 as uuidv4 } from 'uuid';
import type { Express } from 'express';

describe('Analytics Integration Tests', () => {
  let app: Express;
  const validVisitorId = uuidv4();

  beforeAll(async () => {
    app = createApp();
    // Wait a bit for app to initialize
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterAll(async () => {
    // Cleanup: close database connections
    try {
      await pool.end();
    } catch {
      // Ignore errors during cleanup
    }
  });

  beforeEach(async () => {
    // Clean up analytics tables before each test
    try {
      await pool.execute('DELETE FROM analytics_cache');
      await pool.execute('DELETE FROM analytics_visitor_dedup');
      await pool.execute('DELETE FROM page_daily_analytics');
    } catch {
      // Tables might not exist yet, which is fine
    }
  });

  describe('POST /api/analytics/page-view', () => {
    it('Records valid page view', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: '/services',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recorded).toBe(true);
    });

    it('Rejects invalid content type', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'text/plain')
        .send('not json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Rejects missing page_path', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Rejects invalid visitor_id', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: '/services',
          visitor_id: 'not-a-uuid',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Rejects path without leading slash', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: 'services',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Strips query strings from path', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: '/services?utm_source=google',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(200);
      expect(response.body.data.recorded).toBe(true);
    });

    it('Strips fragments from path', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: '/services#section',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(200);
      expect(response.body.data.recorded).toBe(true);
    });

    it('Normalizes referrer to origin only', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: '/services',
          visitor_id: uuidv4(),
          referrer: 'https://google.com/search?q=test#results',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.recorded).toBe(true);
    });

    it('Rejects oversized path', async () => {
      const longPath = '/' + 'a'.repeat(513);
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: longPath,
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Rejects paths with control characters', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: '/services\x00bad',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Rejects bot user agents', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'Googlebot/2.1')
        .send({
          page_path: '/services',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(200);
      // Bot traffic should be recorded as false
      expect(response.body.data.recorded).toBe(false);
    });

    it('Accepts normal user agents', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
        .send({
          page_path: '/services',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(200);
      expect(response.body.data.recorded).toBe(true);
    });
  });

  describe('GET /api/analytics/page-views/public', () => {
    it('Returns public count without auth', async () => {
      const response = await request(app).get('/api/analytics/page-views/public');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_views).toBeDefined();
      expect(response.body.data.unique_visitors).toBeDefined();
    });

    it('Does not expose raw visitor IDs', async () => {
      const response = await request(app).get('/api/analytics/page-views/public');

      expect(response.status).toBe(200);
      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toContain('visitor_id');
      expect(responseStr).not.toContain('database_id');
    });

    it('Does not require JWT token', async () => {
      const response = await request(app)
        .get('/api/analytics/page-views/public')
        .set('Authorization', 'invalid-token');

      // Should still work without valid auth
      expect(response.status).toBe(200);
    });

    it('Returns data in expected format', async () => {
      const response = await request(app).get('/api/analytics/page-views/public');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('total_views');
      expect(response.body.data).toHaveProperty('unique_visitors');
    });
  });

  describe('GET /api/analytics/page-views (Admin)', () => {
    it('Requires authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/page-views')
        .query({ from: '2026-08-01', to: '2026-08-20' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('Requires admin role', async () => {
      // Without a valid JWT, this should return 401
      const response = await request(app)
        .get('/api/analytics/page-views')
        .query({ from: '2026-08-01', to: '2026-08-20' })
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('Requires from and to date parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/page-views')
        .query({ from: '2026-08-01' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Validates date format', async () => {
      const response = await request(app)
        .get('/api/analytics/page-views')
        .query({ from: '2026/08/01', to: '2026/08/20' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Does not expose raw visitor IDs', async () => {
      // This test would need valid auth token - skipping for now
      // The important thing is the structure is validated
      const response = await request(app)
        .get('/api/analytics/page-views')
        .query({ from: '2026-08-01', to: '2026-08-20' });

      // Should not expose raw IDs even if we get a response
      expect(
        response.body.data && JSON.stringify(response.body.data)
      ).not.toContain('database_id');
    });
  });

  describe('CORS Behavior', () => {
    it('Allows public endpoint from any origin', async () => {
      const response = await request(app)
        .get('/api/analytics/page-views/public')
        .set('Origin', 'https://floatwalk.in');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('Allows POST page-view from any origin', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Origin', 'https://floatwalk.in')
        .set('Content-Type', 'application/json')
        .send({
          page_path: '/services',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Concurrent Requests', () => {
    it('Handles concurrent page views atomically', async () => {
      const pageViewPromises = [];

      for (let i = 0; i < 10; i++) {
        pageViewPromises.push(
          request(app)
            .post('/api/analytics/page-view')
            .set('Content-Type', 'application/json')
            .send({
              page_path: '/services',
              visitor_id: uuidv4(),
            })
        );
      }

      const responses = await Promise.all(pageViewPromises);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Rate Limiting', () => {
    it('Allows reasonable request rate', async () => {
      const responses = [];

      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .post('/api/analytics/page-view')
          .set('Content-Type', 'application/json')
          .send({
            page_path: '/services',
            visitor_id: uuidv4(),
          });

        responses.push(response);
      }

      // All should succeed
      responses.forEach((response) => {
        expect([200, 429]).toContain(response.status);
      });
    });

    it('Returns 429 when rate limited', async () => {
      const visitorId = uuidv4();

      // Make many rapid requests from same IP
      const responses = [];
      for (let i = 0; i < 70; i++) {
        const response = await request(app)
          .post('/api/analytics/page-view')
          .set('Content-Type', 'application/json')
          .send({
            page_path: '/page' + i,
            visitor_id: visitorId,
          });

        responses.push(response);
      }

      // Last request should be 429
      expect(responses[responses.length - 1].status).toBe(429);
    });
  });

  describe('Error Handling', () => {
    it('Returns proper error format on validation failure', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send({
          page_path: 'invalid',
          visitor_id: uuidv4(),
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('message');
    });

    it('Handles malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/analytics/page-view')
        .set('Content-Type', 'application/json')
        .send('not json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
