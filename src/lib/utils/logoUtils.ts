/**
 * Get the full URL for a logo from its relative path
 * @param logoUrl - The relative path stored in database (e.g., /uploads/logos/xxx.jpg)
 * @returns Full URL to access the logo
 */
export function getLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  
  console.log('[getLogoUrl] Input logoUrl:', logoUrl);
  
  // If it's already a full URL (http/https), return as-is
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    console.log('[getLogoUrl] Already full URL, returning as-is');
    return logoUrl;
  }
  
  // If it's a data URL (base64), return as-is
  if (logoUrl.startsWith('data:')) {
    console.log('[getLogoUrl] Base64 data URL, returning as-is');
    return logoUrl;
  }
  
  // Construct full URL from backend URL + relative path
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const baseUrl = backendUrl.replace('/api', '');
  
  // Ensure the path starts with /
  const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;
  
  const fullUrl = `${baseUrl}${path}`;
  console.log('[getLogoUrl] Constructed URL:', fullUrl);
  console.log('[getLogoUrl] Backend URL:', backendUrl, '→ Base URL:', baseUrl);
  
  return fullUrl;
}
