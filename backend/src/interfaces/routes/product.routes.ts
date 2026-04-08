import { Router } from 'express';
import * as ProductController from '../controllers/ProductController.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsSchema,
} from '../validators/product.validator.js';

export const productRoutes = Router();

productRoutes.use(authMiddleware(authService));

productRoutes.get('/', validate(listProductsSchema, 'query'), ProductController.listProducts);
productRoutes.post('/', validate(createProductSchema), ProductController.createProduct);
productRoutes.get('/:id', ProductController.getProduct);
productRoutes.patch('/:id', validate(updateProductSchema), ProductController.updateProduct);
productRoutes.delete('/:id', ProductController.deleteProduct);

