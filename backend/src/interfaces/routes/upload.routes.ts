import { Router } from 'express';
import { uploadLogo } from '../controllers/UploadController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import { upload } from '../../config/multer.js';

export const uploadRoutes = Router();

// Require authentication for uploads
uploadRoutes.use(authMiddleware(authService));

// Upload logo endpoint
uploadRoutes.post('/logo', upload.single('logo'), uploadLogo);
