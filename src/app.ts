import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import routes from './routes';
import { sendSuccess, sendError } from './utils/response';

/**
 * Creates and configures the Express application.
 */
export function createApp(): express.Application {
  const app = express();

  app.set('firebase-initialized', !!config.firebase.projectId);

  // ─── Security ────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ────────────────────────────────────────────
  app.use(
    cors({
      origin: config.cors.origins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      credentials: true,
      maxAge: 86400,
    }),
  );

  // ─── Compression ─────────────────────────────────────
  app.use(compression());

  // ─── Body Parsing ────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Logging ─────────────────────────────────────────
  if (config.isProduction) {
    app.use(morgan('combined'));
  } else {
    app.use(morgan('dev'));
  }
  app.use(requestLogger);

  // ─── Rate Limiting ───────────────────────────────────
  app.use(rateLimiter(config.rateLimit.windowMs, config.rateLimit.maxRequests));

  // ─── Trust Proxy (Cloud Run) ─────────────────────────
  app.set('trust proxy', true);

  // ─── Health Check ────────────────────────────────────
  app.get('/health', (_req, res) => {
    sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env['npm_package_version'] ?? '1.0.0',
      uptime: process.uptime(),
    });
  });

  // ─── Readiness Check (for Cloud Run) ─────────────────
  app.get('/ready', (_req, res) => {
    sendSuccess(res, { status: 'ready' });
  });

  // ─── API Routes ──────────────────────────────────────
  app.use('/api/v1', routes);

  // ─── 404 Handler ─────────────────────────────────────
  app.use((_req, res) => {
    sendError(res, 404, 'NOT_FOUND', 'The requested endpoint does not exist');
  });

  // ─── Error Handler (must be last) ────────────────────
  app.use(errorHandler);

  return app;
}
