import { config as loadEnv } from 'dotenv';

loadEnv();

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  mysql: {
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: parseInt(process.env.MYSQL_PORT ?? '3306', 10),
    user: process.env.MYSQL_USER ?? 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE ?? 'styleflow_retail',
  },
  redis: {
    enabled: process.env.REDIS_ENABLED !== 'false',
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? undefined,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'default_access_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'default_refresh_secret_change_in_production',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  },
  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:8080,http://localhost:8081,http://localhost:8082').split(',').map((o) => o.trim()),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },
  app: {
    name: process.env.APP_NAME ?? 'StyleFlow Retail',
  },
  log: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
} as const;
