import type { Request, Response } from 'express';
import path from 'path';
import { unlink } from 'fs/promises';
import sharp from 'sharp';

export async function uploadLogo(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    // Generate URL for the uploaded file
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    
    console.log('[UploadController] Logo uploaded:', {
      filename: req.file.filename,
      size: `${(req.file.size / 1024).toFixed(0)}KB`,
      url: logoUrl
    });

    res.json({ 
      success: true, 
      data: { 
        url: logoUrl,
        filename: req.file.filename,
        size: req.file.size
      } 
    });
  } catch (error: any) {
    console.error('[UploadController] Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function uploadGallery(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  try {
    const filename = `${path.parse(req.file.filename).name}.jpg`;
    const outputPath = path.join(path.dirname(req.file.path), filename);
    await sharp(req.file.path)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outputPath);
    await unlink(req.file.path);

    res.json({
      success: true,
      data: { url: `/uploads/gallery/${filename}`, filename, size: (await sharp(outputPath).metadata()).size ?? 0 },
    });
  } catch (error: any) {
    await unlink(req.file.path).catch(() => undefined);
    res.status(500).json({ success: false, error: error.message || 'Gallery image processing failed' });
  }
}
