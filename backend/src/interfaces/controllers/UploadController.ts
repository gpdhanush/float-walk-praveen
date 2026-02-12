import type { Request, Response } from 'express';

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
