import { redis } from './client.js';
import { CACHE_TTL } from './client.js';

export async function getCached<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const ttl = ttlSeconds ?? CACHE_TTL.DASHBOARD;
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function invalidatePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

export const cacheKeys = {
  dashboard: 'cache:dashboard',
  reportSales: (from: string, to: string) => `cache:report:sales:${from}:${to}`,
  reportExpenses: (from: string, to: string) => `cache:report:expenses:${from}:${to}`,
  reportPurchases: (from: string, to: string) => `cache:report:purchases:${from}:${to}`,
  customer: (id: string) => `cache:customer:${id}`,
};
