import Redis from 'ioredis';
import { config } from '../../config/index.js';

export const CACHE_TTL = {
  DASHBOARD: 300,
  REPORT: 600,
  CUSTOMER: 60,
} as const;

type RedisLike = {
  on: (e: string, fn: (err: Error) => void) => void;
  get: (k: string) => Promise<string | null>;
  setex: (k: string, t: number, v: string) => Promise<void>;
  keys: (p: string) => Promise<string[]>;
  del: (...k: string[]) => Promise<number>;
};

const noopRedis: RedisLike = {
  on: () => {},
  get: async () => null,
  setex: async () => {},
  keys: async () => [],
  del: async () => 0,
};

function createRedisClient(): RedisLike {
  if (!config.redis.enabled) return noopRedis;
  const RedisClient = Redis as unknown as new (opts: object) => RedisLike;
  const client = new RedisClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });
  client.on('error', (err: Error) => {
    console.error('Redis client error:', err);
  });
  return client;
}

export const redis = createRedisClient();

export async function getRedis(): Promise<RedisLike> {
  return redis;
}
