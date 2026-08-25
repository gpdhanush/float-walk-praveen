import { pool, selectRows } from '../pool.js';

export interface GoogleBusinessConnection {
  id: number;
  google_account_id: string | null;
  google_location_id: string | null;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  is_connected: number;
  created_at: string;
  updated_at: string;
}

export type GoogleBusinessConnectionInput = Omit<GoogleBusinessConnection, 'id' | 'created_at' | 'updated_at'>;

export class GoogleBusinessConnectionRepository {
  async getActive(): Promise<GoogleBusinessConnection | null> {
    const rows = await selectRows<GoogleBusinessConnection>(
      'SELECT * FROM google_business_connections WHERE is_connected = 1 ORDER BY id DESC LIMIT 1',
    );
    return rows[0] ?? null;
  }

  async save(input: GoogleBusinessConnectionInput): Promise<GoogleBusinessConnection> {
    const [result] = await pool.execute(
      `INSERT INTO google_business_connections
       (google_account_id, google_location_id, access_token, refresh_token, token_expires_at, is_connected)
       VALUES (?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
       google_account_id = VALUES(google_account_id),
       google_location_id = VALUES(google_location_id),
       access_token = VALUES(access_token),
       refresh_token = VALUES(refresh_token),
       token_expires_at = VALUES(token_expires_at),
       is_connected = 1,
       updated_at = CURRENT_TIMESTAMP(3)`,
      [input.google_account_id, input.google_location_id, input.access_token, input.refresh_token, input.token_expires_at],
    );
    const insertId = Number((result as { insertId: number }).insertId);
    if (insertId) {
      const saved = await this.getById(insertId);
      if (saved) return saved;
    }
    const saved = await this.getActive();
    if (!saved) throw new Error('Google connection could not be loaded after saving');
    return saved;
  }

  async updateTokens(id: number, accessToken: string, expiresAt: Date): Promise<void> {
    await pool.execute(
      'UPDATE google_business_connections SET access_token = ?, token_expires_at = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?',
      [accessToken, expiresAt, id],
    );
  }

  async selectLocation(accountId: string, locationId: string): Promise<void> {
    await pool.execute(
      'UPDATE google_business_connections SET google_account_id = ?, google_location_id = ?, updated_at = CURRENT_TIMESTAMP(3) WHERE is_connected = 1',
      [accountId, locationId],
    );
  }

  async disconnect(): Promise<void> {
    await pool.execute(
      'UPDATE google_business_connections SET is_connected = 0, google_account_id = NULL, google_location_id = NULL, updated_at = CURRENT_TIMESTAMP(3) WHERE is_connected = 1',
    );
  }

  private async getById(id: number): Promise<GoogleBusinessConnection | null> {
    const rows = await selectRows<GoogleBusinessConnection>(
      'SELECT * FROM google_business_connections WHERE id = ?',
      [id],
    );
    return rows[0] ?? null;
  }
}
