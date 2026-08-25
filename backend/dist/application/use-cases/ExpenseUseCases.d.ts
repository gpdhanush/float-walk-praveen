import type { Expense } from '../../domain/entities/Expense.js';
import type { IExpenseRepository, FindExpensesFilter } from '../../domain/repositories/IExpenseRepository.js';
import type { CodeGeneratorService } from '../services/CodeGeneratorService.js';
export declare class ExpenseUseCases {
    private readonly expenseRepo;
    private readonly codeGenerator;
    constructor(expenseRepo: IExpenseRepository, codeGenerator: CodeGeneratorService);
    create(data: {
        category: string;
        amount: number;
        description?: string;
        expenseDate: Date;
    }): Promise<Expense>;
    getById(id: string): Promise<Expense | null>;
    list(filter: FindExpensesFilter): Promise<{
        expenses: Expense[];
        total: number;
    }>;
    update(id: string, data: Partial<Pick<Expense, 'category' | 'amount' | 'description' | 'expenseDate'>>): Promise<Expense | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=ExpenseUseCases.d.ts.map