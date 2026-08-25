import type { Expense } from '../../../domain/entities/Expense.js';
import type { IExpenseRepository, FindExpensesFilter } from '../../../domain/repositories/IExpenseRepository.js';
export declare class ExpenseRepository implements IExpenseRepository {
    create(data: Omit<Expense, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Expense>;
    findById(id: string): Promise<Expense | null>;
    findMany(filter: FindExpensesFilter): Promise<{
        expenses: Expense[];
        total: number;
    }>;
    update(id: string, data: Partial<Expense>): Promise<Expense | null>;
    softDelete(id: string): Promise<boolean>;
}
//# sourceMappingURL=ExpenseRepository.d.ts.map