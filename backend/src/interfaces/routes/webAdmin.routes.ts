import { Router } from 'express';
import * as WebAdminController from '../controllers/WebAdminController.js';
import { authMiddleware, requireRoles } from '../middlewares/auth.js';
import { validateWebPayload } from '../validators/webAdmin.validator.js';
import { authService } from '../../container.js';

export const webAdminRoutes = Router();

webAdminRoutes.use(authMiddleware(authService), requireRoles('ADMIN', 'admin'));
webAdminRoutes.get('/:resource', WebAdminController.list);
webAdminRoutes.post('/:resource', validateWebPayload, WebAdminController.create);
webAdminRoutes.get('/:resource/:id', WebAdminController.get);
webAdminRoutes.patch('/:resource/:id', validateWebPayload, WebAdminController.update);
webAdminRoutes.delete('/:resource/:id', WebAdminController.remove);