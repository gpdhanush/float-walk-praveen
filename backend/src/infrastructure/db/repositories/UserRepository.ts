import type { User, UserStatus } from '../../../domain/entities/User.js';
import type { IUserRepository, FindUsersFilter } from '../../../domain/repositories/IUserRepository.js';
import { pool, selectRows } from '../pool.js';
import { mapRow, mapRows } from '../rowMapper.js';
import { randomUUID } from 'crypto';

function normalizeUserStatus(row: User & { status?: unknown }): User {
  const status = row.status;
  const normalized: UserStatus =
    status === 'ACTIVE' || status === 'INACTIVE'
      ? status
      : (status === true || status === 1 ? 'ACTIVE' : 'INACTIVE');
  return { ...row, status: normalized };
}

export class UserRepository implements IUserRepository {
  async create(data: Omit<User, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<User> {
    const id = data.id ?? randomUUID();
    await pool.execute(
      `INSERT INTO users (id, email, password_hash, name, role, status, store_name, gst_percent, theme, theme_color, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        data.email, 
        data.passwordHash, 
        data.name, 
        data.role, 
        data.status,
        data.storeName || 'FootWear Pro',
        data.gstPercent || 18,
        data.theme || 'light',
        data.themeColor || 'blue',
        data.language || 'en'
      ]
    );
    const rows = await selectRows<Record<string, unknown>>('SELECT * FROM users WHERE id = ?', [
      id,
    ]);
    return normalizeUserStatus(mapRow<User>(rows[0]));
  }

  async findById(id: string): Promise<User | null> {
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    if (!rows.length) return null;
    return normalizeUserStatus(mapRow<User>(rows[0]));
  }

  async findByEmail(email: string): Promise<User | null> {
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (!rows.length) return null;
    return normalizeUserStatus(mapRow<User>(rows[0]));
  }

  async findMany(filter: FindUsersFilter): Promise<{ users: User[]; total: number }> {
    const limit = Math.min(filter.limit ?? 10, 100);
    const offset = filter.offset ?? 0;
    let where = 'WHERE 1=1';
    const params: unknown[] = [];

    if (filter.search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }
    if (filter.role) {
      where += ' AND role = ?';
      params.push(filter.role);
    }
    if (filter.status) {
      where += ' AND status = ?';
      params.push(filter.status);
    }

    const countRows = await selectRows<{ total: number }>(
      `SELECT COUNT(*) as total FROM users ${where}`,
      params
    );
    const total = countRows[0]?.total ?? 0;

    const rows = await selectRows<Record<string, unknown>>(
      `SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const users = mapRows<User>(rows).map(normalizeUserStatus);
    return { users, total };
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    const map: Record<string, string> = {
      passwordHash: 'password_hash',
      name: 'name',
      role: 'role',
      status: 'status',
      storeName: 'store_name',
      storeAddress: 'store_address',
      phone: 'phone',
      gstPercent: 'gst_percent',
      gstNumber: 'gst_number',
      logoUrl: 'logo_url',
      theme: 'theme',
      themeColor: 'theme_color',
      language: 'language',
    };
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined || k === 'id' || k === 'createdAt' || k === 'deletedAt') continue;
      const col = map[k] ?? k;
      fields.push(`${col} = ?`);
      values.push(v);
    }
    if (fields.length === 0) return this.findById(id);
    
    console.log('[UserRepository] Executing UPDATE with fields:', fields);
    console.log('[UserRepository] logoUrl size in update:', 
      data.logoUrl ? `${(data.logoUrl.length / 1024).toFixed(0)}KB` : 'not updating');
    
    values.push(id);
    
    try {
      const [result] = await pool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      console.log('[UserRepository] Update successful, affected rows:', (result as any).affectedRows);
    } catch (error: any) {
      console.error('[UserRepository] Update failed:', error.message);
      console.error('[UserRepository] Error code:', error.code);
      throw error;
    }
    
    const updated = await this.findById(id);
    console.log('[UserRepository] Fetched updated user, logoUrl length:', updated?.logoUrl?.length || 0);
    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const [result] = await pool.execute('UPDATE users SET status = 0 WHERE id = ?', [id]);
    return ((result as unknown) as { affectedRows: number }).affectedRows > 0;
  }
}
