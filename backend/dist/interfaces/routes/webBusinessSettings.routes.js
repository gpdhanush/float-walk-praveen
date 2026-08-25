import { Router } from 'express';
import * as Controller from '../controllers/WebBusinessSettingsController.js';
import { authMiddleware, requireRoles } from '../middlewares/auth.js';
import { authService } from '../../container.js';
export const webBusinessSettingsRoutes = Router();
webBusinessSettingsRoutes.get('/status', Controller.getStatus);
webBusinessSettingsRoutes.get('/hours', Controller.getHours);
webBusinessSettingsRoutes.use(authMiddleware(authService), requireRoles('ADMIN', 'admin'));
webBusinessSettingsRoutes.patch('/status', Controller.updateStatus);
webBusinessSettingsRoutes.put('/hours', Controller.updateHours);
//# sourceMappingURL=webBusinessSettings.routes.js.map