import { randomBytes } from 'crypto';
import { google } from 'googleapis';
import { config } from '../../config/index.js';
import { encryptSecret, decryptSecret } from '../../utils/secretBox.js';
import { GoogleBusinessConnectionRepository } from '../../infrastructure/db/repositories/GoogleBusinessConnectionRepository.js';
import { AppError, ErrorCodes } from '../../utils/errors.js';

const SCOPE = 'https://www.googleapis.com/auth/business.manage';
const stateStore = new Map<string, number>();

export class GoogleBusinessAuthService {
  constructor(private readonly connections: GoogleBusinessConnectionRepository) {}

  private oauthClient(): InstanceType<typeof google.auth.OAuth2> {
    if (!config.googleBusiness.clientId || !config.googleBusiness.clientSecret || !config.googleBusiness.redirectUri) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, 'Google Business OAuth is not configured', 500);
    }
    return new google.auth.OAuth2(config.googleBusiness.clientId, config.googleBusiness.clientSecret, config.googleBusiness.redirectUri);
  }

  createAuthorizationUrl(): string {
    const state = randomBytes(32).toString('hex');
    stateStore.set(state, Date.now() + 10 * 60 * 1000);
    for (const [key, expiresAt] of stateStore) if (expiresAt < Date.now()) stateStore.delete(key);
    return this.oauthClient().generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: [SCOPE], state });
  }

  async handleCallback(code: string, state: string): Promise<void> {
    const expiresAt = stateStore.get(state);
    stateStore.delete(state);
    if (!expiresAt || expiresAt < Date.now()) throw new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired Google OAuth state', 401);
    if (!code) throw new AppError(ErrorCodes.BAD_REQUEST, 'Missing authorization code', 400);
    try {
      const { tokens } = await this.oauthClient().getToken(code);
      if (!tokens.access_token) throw new Error('Google did not return an access token');
      const existing = await this.connections.getActive();
      const refreshToken = tokens.refresh_token ? encryptSecret(tokens.refresh_token) : existing?.refresh_token;
      if (!refreshToken) throw new Error('Google did not return a refresh token');
      await this.connections.save({
        google_account_id: existing?.google_account_id ?? null,
        google_location_id: existing?.google_location_id ?? null,
        access_token: encryptSecret(tokens.access_token),
        refresh_token: refreshToken,
        token_expires_at: new Date(tokens.expiry_date ?? Date.now() + 3600 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        is_connected: 1,
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(ErrorCodes.BAD_REQUEST, 'Google authorization failed', 400);
    }
  }

  async getAccessToken(): Promise<{ token: string; connectionId: number }> {
    const connection = await this.connections.getActive();
    if (!connection) throw new AppError(ErrorCodes.BAD_REQUEST, 'Google Business Profile is not connected', 400);
    if (new Date(connection.token_expires_at).getTime() > Date.now() + 60_000) {
      return { token: decryptSecret(connection.access_token), connectionId: connection.id };
    }
    try {
      const client = this.oauthClient();
      client.setCredentials({ refresh_token: decryptSecret(connection.refresh_token) });
      const { credentials } = await client.refreshAccessToken();
      if (!credentials.access_token) throw new Error('Google did not return a refreshed access token');
      const expiresAt = new Date(credentials.expiry_date ?? Date.now() + 3600 * 1000);
      await this.connections.updateTokens(connection.id, encryptSecret(credentials.access_token), expiresAt);
      return { token: credentials.access_token, connectionId: connection.id };
    } catch {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Google connection expired. Please reconnect Google Business Profile.', 401);
    }
  }

  async status(): Promise<{ connected: boolean; account_id: string | null; location_id: string | null }> {
    const connection = await this.connections.getActive();
    return { connected: Boolean(connection), account_id: connection?.google_account_id ?? null, location_id: connection?.google_location_id ?? null };
  }

  async disconnect(): Promise<void> { await this.connections.disconnect(); }
}
