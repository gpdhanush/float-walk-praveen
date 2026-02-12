import type { Request, Response, NextFunction } from 'express';
import { isAppError } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';
import { config } from '../../config/index.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Request error', { err: err.message, stack: err.stack });

  if (isAppError(err)) {
    res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(config.env !== 'production' && err.details != null ? { details: err.details } : {}),
    });
    return;
  }

  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: config.env === 'production' ? 'An unexpected error occurred' : err.message,
  });
}
