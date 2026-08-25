export class ExpenseUseCases {
    expenseRepo;
    codeGenerator;
    constructor(expenseRepo, codeGenerator) {
        this.expenseRepo = expenseRepo;
        this.codeGenerator = codeGenerator;
    }
    async create(data) {
        const code = await this.codeGenerator.generate('EXP');
        return this.expenseRepo.create({
            id: crypto.randomUUID(),
            code,
            category: data.category,
            amount: data.amount,
            description: data.description ?? null,
            expenseDate: data.expenseDate,
        });
    }
    async getById(id) {
        return this.expenseRepo.findById(id);
    }
    async list(filter) {
        return this.expenseRepo.findMany(filter);
    }
    async update(id, data) {
        return this.expenseRepo.update(id, data);
    }
    async delete(id) {
        return this.expenseRepo.softDelete(id);
    }
}
//# sourceMappingURL=ExpenseUseCases.js.map