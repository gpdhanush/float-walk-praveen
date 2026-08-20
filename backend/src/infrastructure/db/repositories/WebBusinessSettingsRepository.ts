import { pool, selectRows } from '../pool.js';

export interface StoreStatus { closed: boolean; reason: string; updated_at?: string; }
export interface BusinessHour { id: number; day: string; is_closed: boolean; open_time: string | null; close_time: string | null; sort_order: number; }

const asBoolean = (value: unknown): boolean => value === true || value === 1 || value === '1' || value === 'true';

export class WebBusinessSettingsRepository {
  async getStatus(): Promise<StoreStatus> {
    const rows = await selectRows<Record<string, unknown>>('SELECT closed, reason, updated_at FROM web_store_status WHERE id = 1');
    if (!rows.length) {
      await pool.execute('INSERT INTO web_store_status (id, closed, reason) VALUES (1, 0, ?)', ['We are closed today. Please call us for urgent help.']);
      return { closed: false, reason: 'We are closed today. Please call us for urgent help.' };
    }
    return { closed: asBoolean(rows[0].closed), reason: String(rows[0].reason ?? ''), updated_at: String(rows[0].updated_at ?? '') };
  }

  async updateStatus(status: Pick<StoreStatus, 'closed' | 'reason'>): Promise<StoreStatus> {
    await pool.execute('INSERT INTO web_store_status (id, closed, reason) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE closed = VALUES(closed), reason = VALUES(reason)', [status.closed ? 1 : 0, status.reason]);
    return this.getStatus();
  }

  async getHours(): Promise<BusinessHour[]> {
    const rows = await selectRows<Record<string, unknown>>('SELECT id, day, is_closed, TIME_FORMAT(open_time, \'%H:%i\') AS open_time, TIME_FORMAT(close_time, \'%H:%i\') AS close_time, sort_order FROM web_business_hours ORDER BY sort_order');
    return rows.map((row) => ({ ...row, id: Number(row.id), is_closed: asBoolean(row.is_closed), sort_order: Number(row.sort_order), day: String(row.day), open_time: row.open_time ? String(row.open_time) : null, close_time: row.close_time ? String(row.close_time) : null })) as BusinessHour[];
  }

  async updateHours(hours: Array<Pick<BusinessHour, 'day' | 'is_closed' | 'open_time' | 'close_time'>>): Promise<BusinessHour[]> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const hour of hours) {
        await connection.execute('UPDATE web_business_hours SET is_closed = ?, open_time = ?, close_time = ? WHERE day = ?', [hour.is_closed ? 1 : 0, hour.is_closed ? null : hour.open_time, hour.is_closed ? null : hour.close_time, hour.day]);
      }
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    return this.getHours();
  }
}