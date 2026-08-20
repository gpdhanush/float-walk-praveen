import { Router } from 'express';
import { uploadGallery, uploadLogo } from '../controllers/UploadController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { authService } from '../../container.js';
import { galleryUpload, upload } from '../../config/multer.js';

export const uploadRoutes = Router();

// Require authentication for uploads
uploadRoutes.use(authMiddleware(authService));

// Upload logo endpoint
uploadRoutes.post('/logo', upload.single('logo'), uploadLogo);
uploadRoutes.post('/gallery', galleryUpload.single('gallery'), uploadGallery);
