import type { Customer } from '../../../domain/entities/Customer.js';
import type { ICustomerRepository, FindCustomersFilter } from '../../../domain/repositories/ICustomerRepository.js';
export declare class CustomerRepository implements ICustomerRepository {
    create(data: Omit<Customer, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Customer>;
    findById(id: string): Promise<Customer | null>;
    findByMobile(mobile: string, excludeId?: string): Promise<Customer | null>;
    findMany(filter: FindCustomersFilter): Promise<{
        customers: Customer[];
        total: number;
    }>;
    update(id: string, data: Partial<Customer>): Promise<Customer | null>;
    softDelete(id: string): Promise<boolean>;
}
//# sourceMappingURL=CustomerRepository.d.ts.map