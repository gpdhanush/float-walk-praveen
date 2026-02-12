import type { Expense } from '../../domain/entities/Expense.js';
import type {
  IExpenseRepository,
  FindExpensesFilter,
} from '../../domain/repositories/IExpenseRepository.js';
import type { CodeGeneratorService } from '../services/CodeGeneratorService.js';

export class ExpenseUseCases {
  constructor(
    private readonly expenseRepo: IExpenseRepository,
    private readonly codeGenerator: CodeGeneratorService
  ) {}

  async create(data: {
    category: string;
    amount: number;
    description?: string;
    expenseDate: Date;
  }): Promise<Expense> {
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

  async getById(id: string): Promise<Expense | null> {
    return this.expenseRepo.findById(id);
  }

  async list(filter: FindExpensesFilter): Promise<{ expenses: Expense[]; total: number }> {
    return this.expenseRepo.findMany(filter);
  }

  async update(
    id: string,
    data: Partial<Pick<Expense, 'category' | 'amount' | 'description' | 'expenseDate'>>
  ): Promise<Expense | null> {
    return this.expenseRepo.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.expenseRepo.softDelete(id);
  }
}
