import { Router } from 'express';
import { testimonialController } from '../../container.js';

export const testimonialRoutes = Router();
testimonialRoutes.get('/', testimonialController.listPublic);
