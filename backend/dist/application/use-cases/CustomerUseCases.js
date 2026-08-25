import { AppError, ErrorCodes } from '../../utils/errors.js';
export class CustomerUseCases {
    customerRepo;
    constructor(customerRepo) {
        this.customerRepo = customerRepo;
    }
    async create(data) {
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
    async getById(id) {
        return this.customerRepo.findById(id);
    }
    async list(filter) {
        return this.customerRepo.findMany(filter);
    }
    async update(id, data) {
        if (data.mobile) {
            const existing = await this.customerRepo.findByMobile(data.mobile, id);
            if (existing) {
                throw new AppError(ErrorCodes.CONFLICT, 'Another customer has this mobile', 409);
            }
        }
        return this.customerRepo.update(id, data);
    }
    async delete(id) {
        return this.customerRepo.softDelete(id);
    }
}
//# sourceMappingURL=CustomerUseCases.js.map