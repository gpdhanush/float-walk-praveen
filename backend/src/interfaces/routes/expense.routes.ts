import { Router } from 'express';
import * as ExpenseController from '../controllers/ExpenseController.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import {
  createExpenseSchema,
  updateExpenseSchema,
  listExpensesSchema,
} from '../validators/expense.validator.js';

export const expenseRoutes = Router();

expenseRoutes.use(authMiddleware(authService));

expenseRoutes.get('/', validate(listExpensesSchema, 'query'), ExpenseController.listExpenses);
expenseRoutes.post('/', validate(createExpenseSchema), ExpenseController.createExpense);
expenseRoutes.get('/:id', ExpenseController.getExpense);
expenseRoutes.patch('/:id', validate(updateExpenseSchema), ExpenseController.updateExpense);
expenseRoutes.delete('/:id', ExpenseController.deleteExpense);
