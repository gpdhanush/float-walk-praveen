import type { Product } from '../../../domain/entities/Product.js';
import type { IProductRepository, FindProductsFilter } from '../../../domain/repositories/IProductRepository.js';
export declare class ProductRepository implements IProductRepository {
    create(data: Omit<Product, 'id'> & {
        id?: number;
    }): Promise<Product>;
    findById(id: number): Promise<Product | null>;
    findMany(filter: FindProductsFilter): Promise<{
        products: Product[];
        total: number;
    }>;
    update(id: number, data: Partial<Product>): Promise<Product | null>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=ProductRepository.d.ts.map