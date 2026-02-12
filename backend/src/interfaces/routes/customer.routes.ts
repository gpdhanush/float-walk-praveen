import { Router } from 'express';
import * as CustomerController from '../controllers/CustomerController.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersSchema,
} from '../validators/customer.validator.js';

export const customerRoutes = Router();

customerRoutes.use(authMiddleware(authService));

customerRoutes.get('/', validate(listCustomersSchema, 'query'), CustomerController.listCustomers);
customerRoutes.post('/', validate(createCustomerSchema), CustomerController.createCustomer);
customerRoutes.get('/:id', CustomerController.getCustomer);
customerRoutes.patch('/:id', validate(updateCustomerSchema), CustomerController.updateCustomer);
customerRoutes.delete('/:id', CustomerController.deleteCustomer);
