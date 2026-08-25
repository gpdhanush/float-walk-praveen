/**
 * Get the full URL for a logo from its relative path
 * @param logoUrl - The relative path stored in database (e.g., /uploads/logos/xxx.jpg)
 * @returns Full URL to access the logo
 */
export function getLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  
  // If it's already a full URL (http/https), return as-is
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    return logoUrl;
  }
  
  // If it's a data URL (base64), return as-is
  if (logoUrl.startsWith('data:')) {
    return logoUrl;
  }
  
  // Construct full URL from the configured public asset host.
  const baseUrl = import.meta.env.VITE_ASSET_URL.replace(/\/$/, '');
  
  // Ensure the path starts with /
  const path = logoUrl.startsWith('/') ? logoUrl : `/${logoUrl}`;

  return `${baseUrl}${path}`;
}
