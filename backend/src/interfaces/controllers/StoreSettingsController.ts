import type { Request, Response, NextFunction } from 'express';
import { storeSettingsUseCases } from '../../container.js';

export async function getSettings(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const settings = await storeSettingsUseCases.get();
    res.json({ success: true, data: settings ?? {} });
  } catch (e) {
    next(e);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const settings = await storeSettingsUseCases.update(req.body);
    res.json({ success: true, data: settings });
  } catch (e) {
    next(e);
  }
}
