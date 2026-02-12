/**
 * Image utility functions for cropping and compression
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Create image element from file
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Get cropped and compressed image
 */
/**
 * Get cropped image as a Blob (for file upload)
 */
export async function getCroppedImgBlob(
  imageSrc: string,
  pixelCrop: CropArea,
  maxSizeKB: number = 300
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Resize canvas for better compression (max 800x800 for logos)
  const maxDimension = 800;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;
  
  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const scale = maxDimension / Math.max(targetWidth, targetHeight);
    targetWidth = Math.floor(targetWidth * scale);
    targetHeight = Math.floor(targetHeight * scale);
    console.log(`[imageUtils] Resizing from ${pixelCrop.width}x${pixelCrop.height} to ${targetWidth}x${targetHeight}`);
  }

  // Set canvas size to target dimensions
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw the cropped and resized image with high quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Convert to blob and compress
  return new Promise((resolve, reject) => {
    let quality = 0.9;
    let attempts = 0;
    
    const tryCompress = () => {
      attempts++;
      console.log(`[imageUtils] Compression attempt ${attempts}, quality: ${quality}`);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }

          const sizeKB = blob.size / 1024;
          console.log(`[imageUtils] Compressed size: ${sizeKB.toFixed(0)}KB, target: ${maxSizeKB}KB`);
          
          // If size is acceptable or quality is too low, finish
          if (sizeKB <= maxSizeKB || quality <= 0.1) {
            console.log(`[imageUtils] Final blob size: ${sizeKB.toFixed(0)}KB`);
            resolve(blob);
          } else {
            // Reduce quality and try again
            quality -= 0.1;
            tryCompress();
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    tryCompress();
  });
}

/**
 * Get cropped image as base64 string (legacy, for backward compatibility)
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  maxSizeKB: number = 300
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Resize canvas for better compression (max 800x800 for logos)
  const maxDimension = 800;
  let targetWidth = pixelCrop.width;
  let targetHeight = pixelCrop.height;
  
  if (targetWidth > maxDimension || targetHeight > maxDimension) {
    const scale = maxDimension / Math.max(targetWidth, targetHeight);
    targetWidth = Math.floor(targetWidth * scale);
    targetHeight = Math.floor(targetHeight * scale);
    console.log(`[imageUtils] Resizing from ${pixelCrop.width}x${pixelCrop.height} to ${targetWidth}x${targetHeight}`);
  }

  // Set canvas size to target dimensions
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // Draw the cropped and resized image with high quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  // Get blob first
  const blob = await getCroppedImgBlob(imageSrc, pixelCrop, maxSizeKB);
  
  // Convert blob to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64 = reader.result as string;
      console.log(`[imageUtils] Final base64 size: ${(base64.length / 1024).toFixed(0)}KB`);
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPG, PNG, or WEBP image' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
}
