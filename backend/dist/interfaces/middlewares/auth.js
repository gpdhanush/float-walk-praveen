import { AppError, ErrorCodes } from '../../utils/errors.js';
export function authMiddleware(auth) {
    return (req, _res, next) => {
        const authHeader = req.headers.authorization;
        console.log(`[Auth Middleware] ${req.method} ${req.path}`);
        console.log('[Auth Middleware] Authorization header:', authHeader ? 'Present' : 'Missing');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) {
            console.error('[Auth Middleware] No token found in request');
            return next(new AppError(ErrorCodes.UNAUTHORIZED, 'Access token required', 401));
        }
        try {
            const payload = auth.verifyAccessToken(token);
            console.log('[Auth Middleware] Token verified for user:', payload.userId);
            req.user = payload;
            next();
        }
        catch (err) {
            console.error('[Auth Middleware] Token verification failed:', err);
            next(new AppError(ErrorCodes.UNAUTHORIZED, 'Invalid or expired token', 401));
        }
    };
}
export function requireRoles(...roles) {
    return (req, _res, next) => {
        const user = req.user;
        if (!user)
            return next(new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401));
        if (!roles.includes(user.role)) {
            return next(new AppError(ErrorCodes.FORBIDDEN, 'Insufficient permissions', 403));
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map