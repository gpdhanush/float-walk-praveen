import type { Expense } from '../entities/Expense.js';

export interface FindExpensesFilter {
  fromDate?: Date;
  toDate?: Date;
  category?: string;
  limit?: number;
  offset?: number;
}

export interface IExpenseRepository {
  create(data: Omit<Expense, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Expense>;
  findById(id: string): Promise<Expense | null>;
  findMany(filter: FindExpensesFilter): Promise<{ expenses: Expense[]; total: number }>;
  update(id: string, data: Partial<Expense>): Promise<Expense | null>;
  softDelete(id: string): Promise<boolean>;
}
