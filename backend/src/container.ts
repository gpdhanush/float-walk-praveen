import { AuthService } from './application/services/AuthService.js';
import { CodeGeneratorService } from './application/services/CodeGeneratorService.js';
import { AnalyticsService } from './application/services/AnalyticsService.js';
import { UserUseCases } from './application/use-cases/UserUseCases.js';
import { CustomerUseCases } from './application/use-cases/CustomerUseCases.js';
import { InvoiceUseCases } from './application/use-cases/InvoiceUseCases.js';
import { ExpenseUseCases } from './application/use-cases/ExpenseUseCases.js';
import { ProductUseCases } from './application/use-cases/ProductUseCases.js';
import { ReportUseCases } from './application/use-cases/ReportUseCases.js';
import { StoreSettingsUseCases } from './application/use-cases/StoreSettingsUseCases.js';
import { AnalyticsUseCases } from './application/use-cases/AnalyticsUseCases.js';
import { UserRepository } from './infrastructure/db/repositories/UserRepository.js';
import { CustomerRepository } from './infrastructure/db/repositories/CustomerRepository.js';
import { InvoiceRepository } from './infrastructure/db/repositories/InvoiceRepository.js';
import { ExpenseRepository } from './infrastructure/db/repositories/ExpenseRepository.js';
import { ProductRepository } from './infrastructure/db/repositories/ProductRepository.js';
import { StoreSettingsRepository } from './infrastructure/db/repositories/StoreSettingsRepository.js';
import { CodeSequenceRepository } from './infrastructure/db/repositories/CodeSequenceRepository.js';
import { AnalyticsRepository } from './infrastructure/db/repositories/AnalyticsRepository.js';
import { WebAdminRepository } from './infrastructure/db/repositories/WebAdminRepository.js';
import { WebBusinessSettingsRepository } from './infrastructure/db/repositories/WebBusinessSettingsRepository.js';
import { GoogleBusinessService } from './infrastructure/google/GoogleBusinessService.js';
import { GoogleBusinessConnectionRepository } from './infrastructure/db/repositories/GoogleBusinessConnectionRepository.js';
import { TestimonialRepository } from './infrastructure/db/repositories/TestimonialRepository.js';
import { GoogleBusinessAuthService } from './application/services/GoogleBusinessAuthService.js';
import { GoogleBusinessResourceService } from './application/services/GoogleBusinessResourceService.js';
import { GoogleReviewSyncService } from './application/services/GoogleReviewSyncService.js';
import { GoogleBusinessController } from './interfaces/controllers/GoogleBusinessController.js';
import { TestimonialController } from './interfaces/controllers/TestimonialController.js';
import { GoogleReviewSyncJob } from './jobs/GoogleReviewSyncJob.js';

const userRepo = new UserRepository();
const customerRepo = new CustomerRepository();
const invoiceRepo = new InvoiceRepository();
const expenseRepo = new ExpenseRepository();
const productRepo = new ProductRepository();
const storeSettingsRepo = new StoreSettingsRepository();
const codeSequenceRepo = new CodeSequenceRepository();
const analyticsRepo = new AnalyticsRepository();
export const webAdminRepository = new WebAdminRepository();
export const webBusinessSettingsRepository = new WebBusinessSettingsRepository();
export const googleBusinessService = new GoogleBusinessService();
export const googleConnectionRepository = new GoogleBusinessConnectionRepository();
export const testimonialRepository = new TestimonialRepository();

export const authService = new AuthService(userRepo);
export const codeGenerator = new CodeGeneratorService(codeSequenceRepo);
export const analyticsService = new AnalyticsService(analyticsRepo);

export const userUseCases = new UserUseCases(userRepo, authService);
export const customerUseCases = new CustomerUseCases(customerRepo);
export const invoiceUseCases = new InvoiceUseCases(
  invoiceRepo,
  customerRepo,
  codeGenerator
);
export const expenseUseCases = new ExpenseUseCases(expenseRepo, codeGenerator);
export const productUseCases = new ProductUseCases(productRepo);
export const reportUseCases = new ReportUseCases();
export const storeSettingsUseCases = new StoreSettingsUseCases(storeSettingsRepo);
export const analyticsUseCases = new AnalyticsUseCases(analyticsService);
export const googleAuthService = new GoogleBusinessAuthService(googleConnectionRepository);
export const googleResourceService = new GoogleBusinessResourceService(googleAuthService, googleConnectionRepository);
export const googleReviewSyncService = new GoogleReviewSyncService(googleAuthService, googleConnectionRepository, testimonialRepository);
export const googleBusinessController = new GoogleBusinessController(googleAuthService, googleResourceService, googleReviewSyncService);
export const testimonialController = new TestimonialController(testimonialRepository);
export const googleReviewSyncJob = new GoogleReviewSyncJob(googleReviewSyncService);
