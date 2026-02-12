import { Router } from 'express';
import * as StoreSettingsController from '../controllers/StoreSettingsController.js';
import { validate } from '../middlewares/validate.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import { updateSettingsSchema } from '../validators/settings.validator.js';

export const settingsRoutes = Router();

settingsRoutes.use(authMiddleware(authService));

settingsRoutes.get('/', StoreSettingsController.getSettings);
settingsRoutes.patch('/', validate(updateSettingsSchema), StoreSettingsController.updateSettings);
