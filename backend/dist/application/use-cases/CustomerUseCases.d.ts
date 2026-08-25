import type { Customer } from '../../domain/entities/Customer.js';
import type { ICustomerRepository, FindCustomersFilter } from '../../domain/repositories/ICustomerRepository.js';
export declare class CustomerUseCases {
    private readonly customerRepo;
    constructor(customerRepo: ICustomerRepository);
    create(data: {
        name: string;
        mobile: string;
        whatsapp?: string | null;
        altContact?: string | null;
        email?: string | null;
        gender?: string | null;
        address?: string | null;
        notes?: string | null;
    }): Promise<Customer>;
    getById(id: string): Promise<Customer | null>;
    list(filter: FindCustomersFilter): Promise<{
        customers: Customer[];
        total: number;
    }>;
    update(id: string, data: Partial<Pick<Customer, 'name' | 'mobile' | 'whatsapp' | 'altContact' | 'email' | 'gender' | 'address' | 'notes'>>): Promise<Customer | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=CustomerUseCases.d.ts.map