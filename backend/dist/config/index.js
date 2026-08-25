import { config as loadEnv } from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
const backendRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');
loadEnv({ path: join(backendRoot, '.env') });
export const config = {
    env: process.env.NODE_ENV ?? "development",
    port: parseInt(process.env.PORT ?? "3001", 10),
    apiBaseUrl: process.env.API_BASE_URL ?? "",
    mysql: {
        host: process.env.MYSQL_HOST ?? "localhost",
        port: parseInt(process.env.MYSQL_PORT ?? "3306", 10),
        user: process.env.MYSQL_USER ?? "root",
        password: process.env.MYSQL_PASSWORD ?? "",
        database: process.env.MYSQL_DATABASE ?? "styleflow_retail",
    },
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET ??
            "",
        refreshSecret: process.env.JWT_REFRESH_SECRET ??
            "",
        accessExpiry: process.env.JWT_ACCESS_EXPIRY ?? "15m",
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? "7d",
    },
    cors: {
        origins: (process.env.CORS_ORIGINS ?? "")
            .split(",")
            .map((origin) => origin.trim().replace(/\/$/, ""))
            .filter(Boolean),
    },
    app: {
        name: process.env.APP_NAME ?? "StyleFlow Retail",
    },
    googleBusiness: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirectUri: process.env.GOOGLE_REDIRECT_URI ??
            "",
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN ?? "",
        locationId: process.env.GOOGLE_BUSINESS_LOCATION_ID ?? "",
    },
    log: {
        level: process.env.LOG_LEVEL ?? "info",
    },
    pagination: {
        defaultLimit: 10,
        maxLimit: 100,
    },
    analytics: {
        enabled: process.env.ANALYTICS_ENABLED === "true",
        deduplicationMinutes: parseInt(process.env.ANALYTICS_DEDUPLICATION_MINUTES ?? "30", 10),
        trackAdmin: process.env.ANALYTICS_TRACK_ADMIN === "true",
        publicCountEnabled: process.env.ANALYTICS_PUBLIC_COUNT_ENABLED === "true",
        rateLimitPerMinute: parseInt(process.env.ANALYTICS_RATE_LIMIT_PER_MINUTE ?? "60", 10),
        cacheTtlSeconds: parseInt(process.env.ANALYTICS_CACHE_TTL_SECONDS ?? "60", 10),
    },
};
//# sourceMappingURL=index.js.map