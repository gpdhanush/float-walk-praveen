import request from 'supertest';
import { createApp } from '../../app.js';

describe('Health & Metrics', () => {
  const app = createApp();

  it('GET /health returns 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /metrics returns 200 and uptime', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.body.uptime).toBeDefined();
    expect(res.body.memory).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
  });
});
