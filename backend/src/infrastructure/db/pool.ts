import mysql from 'mysql2/promise.js';
import { config } from '../../config/index.js';

export const pool = mysql.createPool({
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

/** Execute SELECT and return rows (avoids mysql2 generic constraint). */
export async function selectRows<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params);
  return ((rows as unknown) as T[]) ?? [];
}

export async function getConnection() {
  return pool.getConnection();
}
