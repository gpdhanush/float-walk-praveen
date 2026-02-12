import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { userRoutes } from './user.routes.js';
import { customerRoutes } from './customer.routes.js';
import { invoiceRoutes } from './invoice.routes.js';
import { expenseRoutes } from './expense.routes.js';
import { reportRoutes } from './report.routes.js';
import { settingsRoutes } from './settings.routes.js';
import { uploadRoutes } from './upload.routes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/customers', customerRoutes);
routes.use('/invoices', invoiceRoutes);
routes.use('/expenses', expenseRoutes);
routes.use('/reports', reportRoutes);
routes.use('/settings', settingsRoutes);
routes.use('/upload', uploadRoutes);
