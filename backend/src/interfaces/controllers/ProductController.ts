import type { Request, Response, NextFunction } from 'express';
import { productUseCases } from '../../container.js';
import { getParamId } from '../../utils/request.js';

export async function createProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const product = await productUseCases.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(getParamId(req));
    const product = await productUseCases.getById(id);
    if (!product) {
      res
        .status(404)
        .json({ success: false, code: 'NOT_FOUND', message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { products, total } = await productUseCases.list(
      req.query as Record<string, string>,
    );
    res.json({ success: true, data: products, meta: { total } });
  } catch (e) {
    next(e);
  }
}

export async function updateProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(getParamId(req));
    const product = await productUseCases.update(id, req.body);
    if (!product) {
      res
        .status(404)
        .json({ success: false, code: 'NOT_FOUND', message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (e) {
    next(e);
  }
}

export async function deleteProduct(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = Number(getParamId(req));
    const ok = await productUseCases.delete(id);
    if (!ok) {
      res
        .status(404)
        .json({ success: false, code: 'NOT_FOUND', message: 'Product not found' });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

