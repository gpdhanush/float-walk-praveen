import type { Request, Response, NextFunction } from 'express';
import { TestimonialRepository, type TestimonialSource } from '../../infrastructure/db/repositories/TestimonialRepository.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';

function id(req: Request): number {
  const value = Number(req.params.id);
  if (!Number.isInteger(value) || value < 1) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid testimonial id', 400);
  return value;
}

function pageValue(value: unknown, fallback: number, max: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export class TestimonialController {
  constructor(private readonly repository: TestimonialRepository) {}

  listAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = pageValue(req.query.page, 1, 100000);
      const limit = pageValue(req.query.limit, 20, 100);
      const source = req.query.source === 'manual' || req.query.source === 'google' ? req.query.source as TestimonialSource : undefined;
      const rating = req.query.rating ? pageValue(req.query.rating, 0, 5) : undefined;
      const published = req.query.is_published === 'true' ? true : req.query.is_published === 'false' ? false : undefined;
      const result = await this.repository.listAdmin({ page, limit, search: typeof req.query.search === 'string' ? req.query.search.trim() : undefined, source, rating, is_published: published });
      res.json({ success: true, data: result.rows, pagination: { page, limit, total: result.total, total_pages: Math.ceil(result.total / limit) } });
    } catch (error) { next(error); }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { const record = await this.repository.getById(id(req)); if (!record) { res.status(404).json({ success: false, message: 'Testimonial not found' }); return; } res.json({ success: true, data: record }); } catch (error) { next(error); }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.status(201).json({ success: true, data: await this.repository.create(req.body) }); } catch (error) { next(error); }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { const record = await this.repository.update(id(req), req.body); if (!record) { res.status(404).json({ success: false, message: 'Testimonial not found' }); return; } res.json({ success: true, data: record }); } catch (error) { next(error); }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { if (!await this.repository.delete(id(req))) { res.status(404).json({ success: false, message: 'Testimonial not found' }); return; } res.status(204).send(); } catch (error) { next(error); }
  };

  publish = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { const record = await this.repository.update(id(req), { is_published: req.body.is_published }); if (!record) { res.status(404).json({ success: false, message: 'Testimonial not found' }); return; } res.json({ success: true, data: record }); } catch (error) { next(error); }
  };

  listPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = pageValue(req.query.page, 1, 100000);
      const limit = pageValue(req.query.limit, 10, 100);
      const rating = req.query.rating ? pageValue(req.query.rating, 0, 5) : undefined;
      const source = req.query.source === 'manual' || req.query.source === 'google' ? req.query.source as TestimonialSource : undefined;
      const result = await this.repository.listPublic(page, limit, rating, source);
      res.json({ success: true, data: result.rows, pagination: { page, limit, total: result.total, total_pages: Math.ceil(result.total / limit) } });
    } catch (error) { next(error); }
  };
}
