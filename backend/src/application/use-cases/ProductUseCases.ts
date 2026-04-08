import type { Product } from '../../domain/entities/Product.js';
import type {
  IProductRepository,
  FindProductsFilter,
} from '../../domain/repositories/IProductRepository.js';

export class ProductUseCases {
  constructor(private readonly productRepo: IProductRepository) {}

  async create(data: {
    name: string;
    price: number;
    description?: string;
  }): Promise<Product> {
    return this.productRepo.create({
      name: data.name,
      price: data.price,
      description: data.description ?? null,
    });
  }

  async getById(id: number): Promise<Product | null> {
    return this.productRepo.findById(id);
  }

  async list(filter: FindProductsFilter): Promise<{ products: Product[]; total: number }> {
    return this.productRepo.findMany(filter);
  }

  async update(
    id: number,
    data: Partial<Pick<Product, 'name' | 'price' | 'description'>>
  ): Promise<Product | null> {
    return this.productRepo.update(id, data as Partial<Product>);
  }

  async delete(id: number): Promise<boolean> {
    return this.productRepo.delete(id);
  }
}

