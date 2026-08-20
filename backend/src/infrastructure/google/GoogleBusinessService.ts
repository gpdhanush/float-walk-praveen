import { config } from '../../config/index.js';
import type { BusinessHour } from '../db/repositories/WebBusinessSettingsRepository.js';

type GooglePeriod = { openDay: string; openTime: string; closeDay: string; closeTime: string };

export class GoogleBusinessService {
  async syncHours(hours: BusinessHour[]): Promise<{ configured: boolean; synced: boolean; message: string }> {
    const googleConfig = config.googleBusiness;
    const configured = Boolean(googleConfig.clientId && googleConfig.clientSecret && googleConfig.refreshToken && googleConfig.locationId);
    if (!configured) return { configured: false, synced: false, message: 'Google Business Profile is not configured; hours were saved locally.' };

    const accessResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: googleConfig.clientId, client_secret: googleConfig.clientSecret, refresh_token: googleConfig.refreshToken, grant_type: 'refresh_token' }),
    });
    const accessData = await accessResponse.json() as { access_token?: string; error_description?: string };
    if (!accessResponse.ok || !accessData.access_token) throw new Error(accessData.error_description || 'Could not obtain Google access token');

    const periods: GooglePeriod[] = hours.filter((hour) => !hour.is_closed && hour.open_time && hour.close_time).map((hour) => ({ openDay: hour.day, openTime: hour.open_time as string, closeDay: hour.day, closeTime: hour.close_time as string }));
    const googleResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/locations/${encodeURIComponent(googleConfig.locationId)}?updateMask=regularHours`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessData.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ regularHours: { periods } }),
    });
    if (!googleResponse.ok) {
      const error = await googleResponse.text();
      throw new Error(`Google Business Profile update failed: ${error}`);
    }
    return { configured: true, synced: true, message: 'Business hours saved and synchronized with Google Business Profile.' };
  }
}