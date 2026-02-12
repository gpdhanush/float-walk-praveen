import type { Request, Response, NextFunction } from 'express';
import type Joi from 'joi';
import { AppError, ErrorCodes } from '../../utils/errors.js';

type Source = 'body' | 'query' | 'params' | 'headers';

export function validate(schema: Joi.Schema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(new AppError(ErrorCodes.VALIDATION_ERROR, message, 400, error.details));
    }
    req[source] = value;
    next();
  };
}
