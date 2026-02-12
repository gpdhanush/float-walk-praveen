import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs/promises';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure storage
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    cb(null, filename);
  },
});

// File filter - only images
const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed'), false);
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});
