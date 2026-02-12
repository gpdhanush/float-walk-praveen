import { api } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}

export const uploadService = {
  /**
   * Upload logo image file to backend
   * @param file - The image file (already cropped and compressed on frontend)
   * @returns The URL path to access the uploaded file
   */
  uploadLogo: async (file: Blob, filename: string = 'logo.jpg'): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logo', file, filename);

      const token = getAuthToken();
      console.log('[uploadService] Uploading logo, size:', `${(file.size / 1024).toFixed(0)}KB`);
      console.log('[uploadService] Auth token exists:', !!token);
      console.log('[uploadService] Upload URL:', `${API_URL}/upload/logo`);

      const response = await fetch(`${API_URL}/upload/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('[uploadService] Response status:', response.status);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        console.error('[uploadService] Upload failed:', error);
        throw new Error(error.error || error.message || 'Upload failed');
      }

      const result = await response.json();
      const logoUrl = result.data?.url || result.url;
      
      console.log('[uploadService] Upload successful, relative URL:', logoUrl);
      
      // Return just the relative path (e.g., /uploads/logos/xxx.jpg)
      // This will be saved to database and works regardless of domain
      return logoUrl;
    } catch (error: any) {
      console.error('[uploadService] Upload error:', error);
      throw error;
    }
  },
};

function getAuthToken(): string {
  const authStore = localStorage.getItem('auth-store');
  if (authStore) {
    try {
      const { state } = JSON.parse(authStore);
      return state?.token || '';
    } catch (e) {
      console.error('Error parsing auth store', e);
    }
  }
  return '';
}
