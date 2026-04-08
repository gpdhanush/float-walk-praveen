import type { Product } from '../entities/Product.js';

export interface FindProductsFilter {
  q?: string;
  limit?: number;
  offset?: number;
}

export interface IProductRepository {
  create(data: Omit<Product, 'id'> & { id?: number }): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findMany(filter: FindProductsFilter): Promise<{ products: Product[]; total: number }>;
  update(id: number, data: Partial<Product>): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}

