import type { Product } from '../../domain/entities/Product.js';
import type { IProductRepository, FindProductsFilter } from '../../domain/repositories/IProductRepository.js';
export declare class ProductUseCases {
    private readonly productRepo;
    constructor(productRepo: IProductRepository);
    create(data: {
        name: string;
        price: number;
        description?: string;
    }): Promise<Product>;
    getById(id: number): Promise<Product | null>;
    list(filter: FindProductsFilter): Promise<{
        products: Product[];
        total: number;
    }>;
    update(id: number, data: Partial<Pick<Product, 'name' | 'price' | 'description'>>): Promise<Product | null>;
    delete(id: number): Promise<boolean>;
}
//# sourceMappingURL=ProductUseCases.d.ts.map