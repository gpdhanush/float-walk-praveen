import { Router } from 'express';
import { authMiddleware, requireRoles } from '../middlewares/auth.js';
import { authService, googleBusinessController, testimonialController } from '../../container.js';
import { validateLocation, validatePublish, validateTestimonial } from '../validators/testimonial.validator.js';

export const googleBusinessRoutes = Router();
const admin = [authMiddleware(authService), requireRoles('ADMIN', 'admin')];

// The callback is protected by the short-lived OAuth state, not a bearer token, because Google cannot forward the admin JWT.
googleBusinessRoutes.get('/google/auth/callback', googleBusinessController.callback);
googleBusinessRoutes.use(...admin);
googleBusinessRoutes.get('/google/auth/url', googleBusinessController.authUrl);
googleBusinessRoutes.get('/google/connection/status', googleBusinessController.status);
googleBusinessRoutes.post('/google/disconnect', googleBusinessController.disconnect);
googleBusinessRoutes.get('/google/accounts', googleBusinessController.accounts);
googleBusinessRoutes.get('/google/accounts/:accountId/locations', googleBusinessController.locations);
googleBusinessRoutes.post('/google/select-location', validateLocation, googleBusinessController.selectLocation);
googleBusinessRoutes.post('/google-reviews/sync', googleBusinessController.sync);

googleBusinessRoutes.get('/testimonials', testimonialController.listAdmin);
googleBusinessRoutes.get('/testimonials/:id', testimonialController.get);
googleBusinessRoutes.post('/testimonials', validateTestimonial, testimonialController.create);
googleBusinessRoutes.put('/testimonials/:id', validateTestimonial, testimonialController.update);
googleBusinessRoutes.delete('/testimonials/:id', testimonialController.remove);
googleBusinessRoutes.patch('/testimonials/:id/publish', validatePublish, testimonialController.publish);
