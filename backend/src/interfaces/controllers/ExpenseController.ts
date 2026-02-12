import type { Request, Response, NextFunction } from 'express';
import { expenseUseCases } from '../../container.js';
import { getParamId } from '../../utils/request.js';

export async function createExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expense = await expenseUseCases.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (e) {
    next(e);
  }
}

export async function getExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expense = await expenseUseCases.getById(getParamId(req));
    if (!expense) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Expense not found' });
      return;
    }
    res.json({ success: true, data: expense });
  } catch (e) {
    next(e);
  }
}

export async function listExpenses(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { expenses, total } = await expenseUseCases.list(
      req.query as Record<string, string>
    );
    res.json({ success: true, data: expenses, meta: { total } });
  } catch (e) {
    next(e);
  }
}

export async function updateExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const expense = await expenseUseCases.update(getParamId(req), req.body);
    if (!expense) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Expense not found' });
      return;
    }
    res.json({ success: true, data: expense });
  } catch (e) {
    next(e);
  }
}

export async function deleteExpense(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ok = await expenseUseCases.delete(getParamId(req));
    if (!ok) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Expense not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
