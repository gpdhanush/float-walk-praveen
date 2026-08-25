import mysql from 'mysql2/promise.js';
export declare const pool: mysql.Pool;
export declare function query<T = unknown>(sql: string, params?: unknown[]): Promise<T>;
/** Execute SELECT and return rows (avoids mysql2 generic constraint). */
export declare function selectRows<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
export declare function getConnection(): Promise<mysql.PoolConnection>;
//# sourceMappingURL=pool.d.ts.map