import { pool, selectRows } from '../pool.js';

export type TestimonialSource = 'manual' | 'google';

export interface TestimonialRecord {
  id: number;
  source: TestimonialSource;
  google_review_id: string | null;
  google_location_id: string | null;
  google_reviewer_name: string | null;
  customer_name: string;
  rating: number;
  testimonial: string;
  service: string | null;
  review_date: string | null;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export interface PublicTestimonial {
  id: number;
  customer_name: string;
  rating: number;
  testimonial: string;
  service: string | null;
  review_date: string | null;
  source: TestimonialSource;
}

export interface AdminTestimonialFilters {
  page: number;
  limit: number;
  search?: string;
  source?: TestimonialSource;
  rating?: number;
  is_published?: boolean;
}

export interface GoogleTestimonialInput {
  google_review_id: string;
  google_location_id: string;
  google_reviewer_name: string;
  customer_name: string;
  rating: number;
  testimonial: string;
  review_date: string | null;
}

const publicColumns = 'id, customer_name, rating, testimonial, service, DATE_FORMAT(review_date, \'%Y-%m-%d\') AS review_date, source';

export class TestimonialRepository {
  async listAdmin(filters: AdminTestimonialFilters): Promise<{ rows: TestimonialRecord[]; total: number }> {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filters.search) { where.push('customer_name LIKE ?'); params.push(`%${filters.search}%`); }
    if (filters.source) { where.push('source = ?'); params.push(filters.source); }
    if (filters.rating) { where.push('rating = ?'); params.push(filters.rating); }
    if (filters.is_published !== undefined) { where.push('is_published = ?'); params.push(filters.is_published ? 1 : 0); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const count = await selectRows<{ total: number }>(`SELECT COUNT(*) AS total FROM web_customer_testimonials ${clause}`, params);
    const offset = (filters.page - 1) * filters.limit;
    const rows = await selectRows<TestimonialRecord>(
      `SELECT id, source, google_review_id, google_location_id, google_reviewer_name, customer_name, rating, testimonial, service,
       DATE_FORMAT(review_date, '%Y-%m-%d') AS review_date, is_published, created_at, updated_at
       FROM web_customer_testimonials ${clause} ORDER BY review_date DESC, id DESC LIMIT ? OFFSET ?`,
      [...params, filters.limit, offset],
    );
    return { rows, total: Number(count[0]?.total ?? 0) };
  }

  async getById(id: number): Promise<TestimonialRecord | null> {
    const rows = await selectRows<TestimonialRecord>(
      `SELECT id, source, google_review_id, google_location_id, google_reviewer_name, customer_name, rating, testimonial, service,
       DATE_FORMAT(review_date, '%Y-%m-%d') AS review_date, is_published, created_at, updated_at
       FROM web_customer_testimonials WHERE id = ?`, [id],
    );
    return rows[0] ?? null;
  }

  async create(data: { customer_name: string; rating: number; testimonial: string; service?: string | null; review_date?: string | null; is_published?: boolean }): Promise<TestimonialRecord> {
    const [result] = await pool.execute(
      `INSERT INTO web_customer_testimonials (source, customer_name, rating, testimonial, service, review_date, is_published)
       VALUES ('manual', ?, ?, ?, ?, ?, ?)`,
      [data.customer_name, data.rating, data.testimonial, data.service ?? null, data.review_date ?? null, data.is_published === false ? 0 : 1],
    );
    const record = await this.getById(Number((result as { insertId: number }).insertId));
    if (!record) throw new Error('Testimonial could not be loaded after creation');
    return record;
  }

  async update(id: number, data: { customer_name?: string; rating?: number; testimonial?: string; service?: string | null; review_date?: string | null; is_published?: boolean }): Promise<TestimonialRecord | null> {
    const fields = Object.keys(data) as Array<keyof typeof data>;
    if (fields.length) {
      await pool.execute(`UPDATE web_customer_testimonials SET ${fields.map((field) => `${field} = ?`).join(', ')} WHERE id = ?`, [...fields.map((field) => data[field] === undefined ? null : data[field] === true ? 1 : data[field] === false ? 0 : data[field]), id]);
    }
    return this.getById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM web_customer_testimonials WHERE id = ?', [id]);
    return Number((result as { affectedRows: number }).affectedRows) > 0;
  }

  async upsertGoogle(review: GoogleTestimonialInput): Promise<'created' | 'updated'> {
    const existing = await selectRows<{ id: number }>('SELECT id FROM web_customer_testimonials WHERE google_review_id = ?', [review.google_review_id]);
    await pool.execute(
      `INSERT INTO web_customer_testimonials
       (source, google_review_id, google_location_id, google_reviewer_name, customer_name, rating, testimonial, review_date, is_published)
       VALUES ('google', ?, ?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE google_location_id = VALUES(google_location_id), google_reviewer_name = VALUES(google_reviewer_name),
       customer_name = VALUES(customer_name), rating = VALUES(rating), testimonial = VALUES(testimonial), review_date = VALUES(review_date),
       updated_at = CURRENT_TIMESTAMP`,
      [review.google_review_id, review.google_location_id, review.google_reviewer_name, review.customer_name, review.rating, review.testimonial, review.review_date],
    );
    return existing.length ? 'updated' : 'created';
  }

  async listPublic(page: number, limit: number, rating?: number, source?: TestimonialSource): Promise<{ rows: PublicTestimonial[]; total: number }> {
    const where = ['is_published = 1'];
    const params: unknown[] = [];
    if (rating) { where.push('rating = ?'); params.push(rating); }
    if (source) { where.push('source = ?'); params.push(source); }
    const clause = `WHERE ${where.join(' AND ')}`;
    const count = await selectRows<{ total: number }>(`SELECT COUNT(*) AS total FROM web_customer_testimonials ${clause}`, params);
    const rows = await selectRows<PublicTestimonial>(`SELECT ${publicColumns} FROM web_customer_testimonials ${clause} ORDER BY review_date DESC, id DESC LIMIT ? OFFSET ?`, [...params, limit, (page - 1) * limit]);
    return { rows, total: Number(count[0]?.total ?? 0) };
  }
}
