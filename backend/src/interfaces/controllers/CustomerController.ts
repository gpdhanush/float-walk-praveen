import type { Request, Response, NextFunction } from 'express';
import { customerUseCases } from '../../container.js';
import { getParamId } from '../../utils/request.js';

export async function createCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customer = await customerUseCases.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (e) {
    next(e);
  }
}

export async function getCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customer = await customerUseCases.getById(getParamId(req));
    if (!customer) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Customer not found' });
      return;
    }
    res.json({ success: true, data: customer });
  } catch (e) {
    next(e);
  }
}

export async function listCustomers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { customers, total } = await customerUseCases.list(
      req.query as Record<string, string>
    );
    res.json({ success: true, data: customers, meta: { total } });
  } catch (e) {
    next(e);
  }
}

export async function updateCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const customer = await customerUseCases.update(getParamId(req), req.body);
    if (!customer) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Customer not found' });
      return;
    }
    res.json({ success: true, data: customer });
  } catch (e) {
    next(e);
  }
}

export async function deleteCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ok = await customerUseCases.delete(getParamId(req));
    if (!ok) {
      res.status(404).json({ success: false, code: 'NOT_FOUND', message: 'Customer not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
