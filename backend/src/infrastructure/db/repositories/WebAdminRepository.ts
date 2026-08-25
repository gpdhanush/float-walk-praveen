import { pool, selectRows } from '../pool.js';

export type WebResource =
  | 'enquiries'
  | 'appointments'
  | 'testimonials'
  | 'gallery'
  | 'services';

type ResourceDefinition = {
  table: string;
  primaryKey: string;
  columns: string[];
  orderBy: string;
};

export const webResourceDefinitions: Record<WebResource, ResourceDefinition> = {
  enquiries: {
    table: 'web_contact_enquiries',
    primaryKey: 'id',
    columns: ['name', 'phone', 'email', 'service', 'preferred_date', 'preferred_time', 'message', 'status'],
    orderBy: 'created_at DESC',
  },
  appointments: {
    table: 'web_customer_appointments',
    primaryKey: 'id',
    columns: ['customer_name', 'phone', 'service', 'preferred_date', 'preferred_time', 'message', 'status', 'confirmation_method'],
    orderBy: 'preferred_date DESC, preferred_time DESC, created_at DESC',
  },
  testimonials: {
    table: 'web_customer_testimonials',
    primaryKey: 'id',
    columns: ['source', 'google_review_id', 'google_location_id', 'google_reviewer_name', 'customer_name', 'rating', 'testimonial', 'service', 'review_date', 'is_published'],
    orderBy: 'created_at DESC',
  },
  gallery: {
    table: 'web_gallery_media',
    primaryKey: 'id',
    columns: ['media_id', 'type', 'title', 'caption', 'src', 'url', 'poster', 'is_active', 'sort_order'],
    orderBy: 'sort_order ASC, created_at DESC',
  },
  services: {
    table: 'web_services_dropdown',
    primaryKey: 'id',
    columns: ['service_name', 'description', 'is_active'],
    orderBy: 'service_name ASC',
  },
};

export type WebAdminRecord = Record<string, unknown>;

function normalizeDateOnly(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : value;
}

export class WebAdminRepository {
  private definition(resource: WebResource): ResourceDefinition {
    return webResourceDefinitions[resource];
  }

  async list(resource: WebResource, limit: number, offset: number): Promise<{ rows: WebAdminRecord[]; total: number }> {
    const definition = this.definition(resource);
    const columns = ['id', ...definition.columns, 'created_at', 'updated_at']
      .map((column) => ['preferred_date', 'review_date'].includes(column) ? `DATE_FORMAT(${column}, '%Y-%m-%d') AS ${column}` : column)
      .join(', ');
    const countRows = await selectRows<{ total: number }>(
      `SELECT COUNT(*) AS total FROM ${definition.table}`,
    );
    const rows = await selectRows<WebAdminRecord>(
      `SELECT ${columns} FROM ${definition.table} ORDER BY ${definition.orderBy} LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return { rows, total: Number(countRows[0]?.total ?? 0) };
  }

  async getById(resource: WebResource, id: number): Promise<WebAdminRecord | null> {
    const definition = this.definition(resource);
    const columns = ['id', ...definition.columns, 'created_at', 'updated_at']
      .map((column) => ['preferred_date', 'review_date'].includes(column) ? `DATE_FORMAT(${column}, '%Y-%m-%d') AS ${column}` : column)
      .join(', ');
    const rows = await selectRows<WebAdminRecord>(
      `SELECT ${columns} FROM ${definition.table} WHERE ${definition.primaryKey} = ?`,
      [id],
    );
    return rows[0] ?? null;
  }

  async create(resource: WebResource, data: Record<string, unknown>): Promise<WebAdminRecord> {
    const definition = this.definition(resource);
    const fields = Object.keys(data).filter((key) => definition.columns.includes(key));
    const placeholders = fields.map(() => '?').join(', ');
    const [result] = await pool.execute(
      `INSERT INTO ${definition.table} (${fields.join(', ')}) VALUES (${placeholders})`,
      fields.map((field) => normalizeDateOnly(data[field]) ?? null),
    );
    const id = Number((result as { insertId: number }).insertId);
    const record = await this.getById(resource, id);
    if (!record) throw new Error('Created web record could not be loaded');
    return record;
  }

  async update(resource: WebResource, id: number, data: Record<string, unknown>): Promise<WebAdminRecord | null> {
    const definition = this.definition(resource);
    const fields = Object.keys(data).filter((key) => definition.columns.includes(key));
    if (fields.length) {
      await pool.execute(
        `UPDATE ${definition.table} SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE ${definition.primaryKey} = ?`,
        [...fields.map((field) => normalizeDateOnly(data[field]) ?? null), id],
      );
    }
    return this.getById(resource, id);
  }

  async delete(resource: WebResource, id: number): Promise<boolean> {
    const definition = this.definition(resource);
    const [result] = await pool.execute(
      `DELETE FROM ${definition.table} WHERE ${definition.primaryKey} = ?`,
      [id],
    );
    return (result as { affectedRows: number }).affectedRows > 0;
  }
}