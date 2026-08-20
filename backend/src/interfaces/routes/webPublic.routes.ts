import { Router } from 'express';
import * as Controller from '../controllers/WebPublicController.js';
import { validateWebPayload } from '../validators/webAdmin.validator.js';

export const webPublicRoutes = Router();

webPublicRoutes.get('/status', Controller.status);
webPublicRoutes.get('/hours', Controller.hours);
webPublicRoutes.get('/:resource', Controller.list);
webPublicRoutes.post('/:resource', validateWebPayload, Controller.createSubmission);