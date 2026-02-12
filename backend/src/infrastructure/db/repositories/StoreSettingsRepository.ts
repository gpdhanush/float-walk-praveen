import type { StoreSettings } from '../../../domain/entities/StoreSettings.js';
import type { IStoreSettingsRepository } from '../../../domain/repositories/IStoreSettingsRepository.js';
import { pool, selectRows } from '../pool.js';
import { mapRow } from '../rowMapper.js';
import { randomUUID } from 'crypto';

export class StoreSettingsRepository implements IStoreSettingsRepository {
  async get(): Promise<StoreSettings | null> {
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM store_settings LIMIT 1'
    );
    if (!rows.length) return null;
    return mapRow<StoreSettings>(rows[0]);
  }

  async upsert(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const existing = await this.get();
    const map: Record<string, string> = {
      storeName: 'store_name',
      ownerName: 'owner_name',
      logoUrl: 'logo_url',
      address: 'address',
      phone: 'phone',
      mobile: 'mobile',
      email: 'email',
      taxNumber: 'tax_number',
      gstPercent: 'gst_percent',
      gstNumber: 'gst_number',
      theme: 'theme',
      themeColor: 'theme_color',
      language: 'language',
    };

    if (existing) {
      const fields: string[] = [];
      const values: unknown[] = [];
      for (const [k, v] of Object.entries(data)) {
        if (v === undefined || k === 'id') continue;
        const col = map[k] ?? k;
        fields.push(`${col} = ?`);
        values.push(v);
      }
      if (fields.length > 0) {
        values.push(existing.id);
        await pool.execute(
          `UPDATE store_settings SET ${fields.join(', ')}, updated_at = NOW(3) WHERE id = ?`,
          values
        );
      }
      const rows = await selectRows<Record<string, unknown>>(
        'SELECT * FROM store_settings WHERE id = ?',
        [existing.id]
      );
      return mapRow<StoreSettings>(rows[0]);
    }

    const id = data.id ?? randomUUID();
    await pool.execute(
      `INSERT INTO store_settings (id, store_name, owner_name, logo_url, address, phone, mobile, email, tax_number, gst_percent, gst_number, theme, theme_color, language)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.storeName ?? 'My Store',
        data.ownerName ?? null,
        data.logoUrl ?? null,
        data.address ?? null,
        data.phone ?? null,
        data.mobile ?? null,
        data.email ?? null,
        data.taxNumber ?? null,
        data.gstPercent ?? 18,
        data.gstNumber ?? null,
        data.theme ?? 'light',
        data.themeColor ?? 'blue',
        data.language ?? 'en',
      ]
    );
    const rows = await selectRows<Record<string, unknown>>(
      'SELECT * FROM store_settings WHERE id = ?',
      [id]
    );
    return mapRow<StoreSettings>(rows[0]);
  }
}
