import type { Request, Response, NextFunction } from 'express';
import { googleBusinessService, webBusinessSettingsRepository } from '../../container.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';

export async function getStatus(_req: Request, res: Response, next: NextFunction): Promise<void> { try { res.json({ success: true, data: await webBusinessSettingsRepository.getStatus() }); } catch (error) { next(error); } }

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (typeof req.body.closed !== 'boolean' || typeof req.body.reason !== 'string') throw new AppError(ErrorCodes.VALIDATION_ERROR, 'closed must be boolean and reason must be a string', 400);
    res.json({ success: true, data: await webBusinessSettingsRepository.updateStatus({ closed: req.body.closed, reason: req.body.reason.trim() }) });
  } catch (error) { next(error); }
}

export async function getHours(_req: Request, res: Response, next: NextFunction): Promise<void> { try { res.json({ success: true, data: await webBusinessSettingsRepository.getHours() }); } catch (error) { next(error); } }

export async function updateHours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!Array.isArray(req.body.hours) || req.body.hours.length !== 7) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Exactly seven weekly hours are required', 400);
    const hours = req.body.hours.map((hour: any) => {
      if (!/^[A-Z]+$/.test(hour.day) || typeof hour.is_closed !== 'boolean') throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid business hour day or closed value', 400);
      if (!hour.is_closed && (!/^\d{2}:\d{2}$/.test(hour.open_time) || !/^\d{2}:\d{2}$/.test(hour.close_time))) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Open and close times are required for open days', 400);
      return { day: hour.day, is_closed: hour.is_closed, open_time: hour.open_time || null, close_time: hour.close_time || null };
    });
    const saved = await webBusinessSettingsRepository.updateHours(hours);
    const google = await googleBusinessService.syncHours(saved);
    res.json({ success: true, data: saved, google });
  } catch (error) { next(error); }
}