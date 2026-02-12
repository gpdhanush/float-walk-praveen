import type { Customer } from '../entities/Customer.js';

export interface FindCustomersFilter {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ICustomerRepository {
  create(data: Omit<Customer, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByMobile(mobile: string, excludeId?: string): Promise<Customer | null>;
  findMany(filter: FindCustomersFilter): Promise<{ customers: Customer[]; total: number }>;
  update(id: string, data: Partial<Customer>): Promise<Customer | null>;
  softDelete(id: string): Promise<boolean>;
}
