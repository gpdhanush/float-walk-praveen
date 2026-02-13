import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config/index.js';
import { routes } from './interfaces/routes/index.js';
import { errorHandler } from './interfaces/middlewares/errorHandler.js';
import { requestLogger } from './interfaces/middlewares/requestLogger.js';
import { setupSwagger } from './config/swagger.js';

export function createApp() {
  const app = express();

  // Trust first proxy (e.g. cPanel / nginx) so X-Forwarded-For is used for rate limiting
  app.set('trust proxy', 1);

  app.use(helmet({ 
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false, // Allow images to be loaded from frontend
  }));
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' })); // Increased for base64 image uploads
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  
  // Serve uploaded files statically with CORS headers
  app.use('/uploads', (_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));
  app.use(
    rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      message: { success: false, code: 'RATE_LIMIT', message: 'Too many requests' },
    })
  );
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/metrics', (_req, res) => {
    res.json({
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    });
  });

  setupSwagger(app);
  app.use('/api', routes);

  app.use(errorHandler);
  return app;
}
