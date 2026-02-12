import type { Request, Response, NextFunction } from 'express';
import { reportUseCases } from '../../container.js';

export async function salesReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportUseCases.salesReport(req.query as { fromDate?: string; toDate?: string });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function expensesReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportUseCases.expensesReport(req.query as { fromDate?: string; toDate?: string });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}

export async function purchasesReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await reportUseCases.purchasesReport(req.query as { fromDate?: string; toDate?: string });
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
}
