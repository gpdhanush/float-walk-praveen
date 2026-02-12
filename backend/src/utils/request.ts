import type { Request } from 'express';

/** Get single :id param from request (Express may return string | string[]). */
export function getParamId(req: Request, param = 'id'): string {
  const value = req.params[param];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}
