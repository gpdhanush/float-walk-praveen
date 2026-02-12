import type { BaseEntity } from './BaseEntity.js';

export interface Expense extends BaseEntity {
  code: string;
  category: string;
  amount: number;
  description: string | null;
  expenseDate: Date;
}
