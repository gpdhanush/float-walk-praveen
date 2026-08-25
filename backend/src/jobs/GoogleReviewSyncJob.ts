import { config } from '../config/index.js';
import { GoogleReviewSyncService } from '../application/services/GoogleReviewSyncService.js';
import { logger } from '../utils/logger.js';

export class GoogleReviewSyncJob {
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly syncService: GoogleReviewSyncService) {}

  start(): void {
    if (!config.googleBusiness.syncEnabled || this.timer) return;
    this.timer = setInterval(() => { void this.run(); }, config.googleBusiness.syncIntervalMs);
    this.timer.unref?.();
    logger.info('Google review sync scheduler started', { intervalMs: config.googleBusiness.syncIntervalMs });
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async run(): Promise<void> {
    if (this.running) { logger.warn('Google review sync skipped because another sync is running'); return; }
    this.running = true;
    logger.info('Google review sync started');
    try { await this.syncService.sync(); }
    catch (error) { logger.error('Google review sync failed', { error: error instanceof Error ? error.message : 'unknown error' }); }
    finally { this.running = false; }
  }
}
