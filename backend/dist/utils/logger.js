import winston from 'winston';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
const logsDirectory = join(dirname(fileURLToPath(import.meta.url)), '../../logs');
mkdirSync(logsDirectory, { recursive: true });
export const logger = winston.createLogger({
    level: config.log.level,
    format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: { service: config.app.name },
    transports: [
        new winston.transports.File({ filename: join(logsDirectory, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: join(logsDirectory, 'combined.log') }),
    ],
});
if (config.env !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.printf(({ level, message, timestamp, ...meta }) => {
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
            return `${timestamp} [${level}] ${message} ${metaStr}`;
        })),
    }));
}
//# sourceMappingURL=logger.js.map