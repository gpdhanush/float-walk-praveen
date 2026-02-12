import { AuthService } from './application/services/AuthService.js';
import { CodeGeneratorService } from './application/services/CodeGeneratorService.js';
import { UserUseCases } from './application/use-cases/UserUseCases.js';
import { CustomerUseCases } from './application/use-cases/CustomerUseCases.js';
import { InvoiceUseCases } from './application/use-cases/InvoiceUseCases.js';
import { ExpenseUseCases } from './application/use-cases/ExpenseUseCases.js';
import { ReportUseCases } from './application/use-cases/ReportUseCases.js';
import { StoreSettingsUseCases } from './application/use-cases/StoreSettingsUseCases.js';
import { UserRepository } from './infrastructure/db/repositories/UserRepository.js';
import { CustomerRepository } from './infrastructure/db/repositories/CustomerRepository.js';
import { InvoiceRepository } from './infrastructure/db/repositories/InvoiceRepository.js';
import { ExpenseRepository } from './infrastructure/db/repositories/ExpenseRepository.js';
import { StoreSettingsRepository } from './infrastructure/db/repositories/StoreSettingsRepository.js';
import { CodeSequenceRepository } from './infrastructure/db/repositories/CodeSequenceRepository.js';

const userRepo = new UserRepository();
const customerRepo = new CustomerRepository();
const invoiceRepo = new InvoiceRepository();
const expenseRepo = new ExpenseRepository();
const storeSettingsRepo = new StoreSettingsRepository();
const codeSequenceRepo = new CodeSequenceRepository();

export const authService = new AuthService(userRepo);
export const codeGenerator = new CodeGeneratorService(codeSequenceRepo);

export const userUseCases = new UserUseCases(userRepo, authService);
export const customerUseCases = new CustomerUseCases(customerRepo);
export const invoiceUseCases = new InvoiceUseCases(
  invoiceRepo,
  customerRepo,
  codeGenerator
);
export const expenseUseCases = new ExpenseUseCases(expenseRepo, codeGenerator);
export const reportUseCases = new ReportUseCases();
export const storeSettingsUseCases = new StoreSettingsUseCases(storeSettingsRepo);
