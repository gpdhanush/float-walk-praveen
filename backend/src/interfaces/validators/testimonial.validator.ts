import Joi from 'joi';
import type { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '../../utils/errors.js';

const testimonialSchema = Joi.object({
  customer_name: Joi.string().trim().min(1).max(150).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  testimonial: Joi.string().trim().min(1).required(),
  service: Joi.string().trim().max(150).allow(null, ''),
  review_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).allow(null, ''),
  is_published: Joi.boolean(),
});

export function validateTestimonial(req: Request, _res: Response, next: NextFunction): void {
  const schema = req.method === 'PUT' ? testimonialSchema.fork(['customer_name', 'rating', 'testimonial'], (field) => field.optional()) : testimonialSchema;
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) { next(new AppError(ErrorCodes.VALIDATION_ERROR, error.details.map((detail) => detail.message).join(', '), 400)); return; }
  req.body = value;
  next();
}

export function validatePublish(req: Request, _res: Response, next: NextFunction): void {
  const { error, value } = Joi.object({ is_published: Joi.boolean().required() }).validate(req.body, { stripUnknown: true });
  if (error) { next(new AppError(ErrorCodes.VALIDATION_ERROR, 'is_published must be a boolean', 400)); return; }
  req.body = value;
  next();
}

export function validateLocation(req: Request, _res: Response, next: NextFunction): void {
  const { error, value } = Joi.object({ account_id: Joi.string().pattern(/^(accounts\/)?[A-Za-z0-9_-]+$/).required(), location_id: Joi.string().pattern(/^(locations\/)?[A-Za-z0-9_-]+$/).required() }).validate(req.body, { stripUnknown: true });
  if (error) { next(new AppError(ErrorCodes.VALIDATION_ERROR, 'Valid account_id and location_id are required', 400)); return; }
  req.body = value;
  next();
}
