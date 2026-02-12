import { Router } from 'express';
import * as AuthController from '../controllers/AuthController.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, refreshSchema } from '../validators/auth.validator.js';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), AuthController.login);
authRoutes.post('/logout', AuthController.logout);
authRoutes.post('/refresh', validate(refreshSchema), AuthController.refresh);
