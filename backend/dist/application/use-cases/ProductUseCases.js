export class ProductUseCases {
    productRepo;
    constructor(productRepo) {
        this.productRepo = productRepo;
    }
    async create(data) {
        return this.productRepo.create({
            name: data.name,
            price: data.price,
            description: data.description ?? null,
        });
    }
    async getById(id) {
        return this.productRepo.findById(id);
    }
    async list(filter) {
        return this.productRepo.findMany(filter);
    }
    async update(id, data) {
        return this.productRepo.update(id, data);
    }
    async delete(id) {
        return this.productRepo.delete(id);
    }
}
//# sourceMappingURL=ProductUseCases.js.map