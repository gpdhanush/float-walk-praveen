import type { Customer } from '../../domain/entities/Customer.js';
import type {
  ICustomerRepository,
  FindCustomersFilter,
} from '../../domain/repositories/ICustomerRepository.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';

export class CustomerUseCases {
  constructor(private readonly customerRepo: ICustomerRepository) {}

  async create(data: {
    name: string;
    mobile: string;
    whatsapp?: string | null;
    altContact?: string | null;
    email?: string | null;
    gender?: string | null;
    address?: string | null;
    notes?: string | null;
  }): Promise<Customer> {
    const existing = await this.customerRepo.findByMobile(data.mobile);
    if (existing) {
      throw new AppError(ErrorCodes.CONFLICT, 'Customer with this mobile already exists', 409);
    }
    return this.customerRepo.create({
      id: crypto.randomUUID(),
      name: data.name,
      mobile: data.mobile,
      whatsapp: data.whatsapp ?? null,
      altContact: data.altContact ?? null,
      email: data.email ?? null,
      gender: data.gender ?? null,
      address: data.address ?? null,
      notes: data.notes ?? null,
    });
  }

  async getById(id: string): Promise<Customer | null> {
    return this.customerRepo.findById(id);
  }

  async list(filter: FindCustomersFilter): Promise<{ customers: Customer[]; total: number }> {
    return this.customerRepo.findMany(filter);
  }

  async update(
    id: string,
    data: Partial<Pick<Customer, 'name' | 'mobile' | 'whatsapp' | 'altContact' | 'email' | 'gender' | 'address' | 'notes'>>
  ): Promise<Customer | null> {
    if (data.mobile) {
      const existing = await this.customerRepo.findByMobile(data.mobile, id);
      if (existing) {
        throw new AppError(ErrorCodes.CONFLICT, 'Another customer has this mobile', 409);
      }
    }
    return this.customerRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.customerRepo.softDelete(id);
  }
}
