import { Router } from 'express';
import * as ReportController from '../controllers/ReportController.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import { reportDateRangeSchema } from '../validators/report.validator.js';

export const reportRoutes = Router();

reportRoutes.use(authMiddleware(authService));

reportRoutes.get(
  '/sales',
  validate(reportDateRangeSchema, 'query'),
  ReportController.salesReport
);
reportRoutes.get(
  '/expenses',
  validate(reportDateRangeSchema, 'query'),
  ReportController.expensesReport
);
reportRoutes.get(
  '/purchases',
  validate(reportDateRangeSchema, 'query'),
  ReportController.purchasesReport
);
