import { Router } from 'express';
import * as UserController from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';

export const userRoutes = Router();

userRoutes.use(authMiddleware(authService));

userRoutes.get('/profile', UserController.getProfile);
userRoutes.patch('/profile', UserController.updateProfile);
userRoutes.post('/change-password', UserController.changePassword);
