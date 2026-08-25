import type { Request, Response, NextFunction } from 'express';
import { GoogleBusinessAuthService } from '../../application/services/GoogleBusinessAuthService.js';
import { GoogleBusinessResourceService } from '../../application/services/GoogleBusinessResourceService.js';
import { GoogleReviewSyncService } from '../../application/services/GoogleReviewSyncService.js';

export class GoogleBusinessController {
  constructor(
    private readonly auth: GoogleBusinessAuthService,
    private readonly resources: GoogleBusinessResourceService,
    private readonly syncService: GoogleReviewSyncService,
  ) {}

  authUrl = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json({ success: true, data: { url: this.auth.createAuthorizationUrl() } }); } catch (error) { next(error); }
  };

  callback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.auth.handleCallback(String(req.query.code ?? ''), String(req.query.state ?? ''));
      res.status(200).send('Google Business Profile connected successfully.');
    } catch (error) { next(error); }
  };

  status = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json({ success: true, data: await this.auth.status() }); } catch (error) { next(error); }
  };

  disconnect = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.auth.disconnect(); res.json({ success: true, message: 'Google Business Profile disconnected' }); } catch (error) { next(error); }
  };

  accounts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json({ success: true, data: await this.resources.accounts() }); } catch (error) { next(error); }
  };

  locations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json({ success: true, data: await this.resources.locations(String(req.params.accountId)) }); } catch (error) { next(error); }
  };

  selectLocation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { await this.resources.selectLocation(req.body.account_id, req.body.location_id); res.json({ success: true, message: 'Google Business location selected' }); } catch (error) { next(error); }
  };

  sync = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try { res.json({ success: true, message: 'Google reviews synced successfully', data: await this.syncService.sync() }); } catch (error) { next(error); }
  };
}
