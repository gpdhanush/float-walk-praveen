import { GoogleBusinessAuthService } from './GoogleBusinessAuthService.js';
import { GoogleBusinessConnectionRepository } from '../../infrastructure/db/repositories/GoogleBusinessConnectionRepository.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';
import { logger } from '../../utils/logger.js';

export class GoogleBusinessResourceService {
  constructor(private readonly auth: GoogleBusinessAuthService, private readonly connections: GoogleBusinessConnectionRepository) {}

  private async get<T>(url: string): Promise<T> {
    logger.info('Google Business API request started', { url });
    const { token } = await this.auth.getAccessToken();
    logger.info('Google Business access token obtained');
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) {
      const body = await response.text();
      logger.error('Google Business API request failed', {
        status: response.status,
        retryAfter: response.headers.get('retry-after'),
        body,
        url,
      });
      throw new AppError(ErrorCodes.INTERNAL_ERROR, `Google Business request failed (${response.status})`, response.status === 429 ? 429 : 502);
    }
    logger.info('Google Business API request succeeded', { status: response.status, url });
    return response.json() as Promise<T>;
  }

  private resourceId(value: string, prefix: 'accounts' | 'locations'): string {
    const id = value.startsWith(`${prefix}/`) ? value.slice(prefix.length + 1) : value;
    if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new AppError(ErrorCodes.VALIDATION_ERROR, `Invalid Google ${prefix.slice(0, -1)} id`, 400);
    return `${prefix}/${id}`;
  }

  async accounts(): Promise<unknown[]> {
    const data = await this.get<{ accounts?: unknown[] }>('https://mybusinessaccountmanagement.googleapis.com/v1/accounts');
    logger.info('Google Business accounts loaded', { count: data.accounts?.length ?? 0 });
    return data.accounts ?? [];
  }

  async locations(accountId: string): Promise<unknown[]> {
    const account = this.resourceId(accountId, 'accounts');
    const data = await this.get<{ locations?: unknown[] }>(`https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations?readMask=name,title,storefrontAddress`);
    logger.info('Google Business locations loaded', { account, count: data.locations?.length ?? 0 });
    return data.locations ?? [];
  }

  async selectLocation(accountId: string, locationId: string): Promise<void> {
    const account = this.resourceId(accountId, 'accounts');
    const location = this.resourceId(locationId, 'locations');
    const connection = await this.connections.getActive();
    if (!connection) throw new AppError(ErrorCodes.BAD_REQUEST, 'Google Business Profile is not connected', 400);
    await this.connections.selectLocation(account, location);
    logger.info('Google Business location selected', { account, location });
  }
}
