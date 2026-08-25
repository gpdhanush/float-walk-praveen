import type { Request, Response, NextFunction } from 'express';
import type { TokenPayload } from '../../application/services/AuthService.js';
import type { AuthService } from '../../application/services/AuthService.js';
export interface AuthLocals {
    user: TokenPayload;
}
export declare function authMiddleware(auth: AuthService): (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireRoles(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map