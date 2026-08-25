import { logger } from '../../utils/logger.js';
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration,
            ip: req.ip,
        });
    });
    next();
}
//# sourceMappingURL=requestLogger.js.map