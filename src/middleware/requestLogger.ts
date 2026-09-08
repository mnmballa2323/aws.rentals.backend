import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

/**
 * Request logging middleware.
 * Assigns a unique request ID and logs request/response lifecycle.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const requestId = (req.headers['x-request-id'] as string | undefined) ?? uuidv4();
  const startTime = Date.now();

  // Attach request ID to response headers
  res.setHeader('X-Request-Id', requestId);

  // Log request start with body and headers (safely masked via logger.info)
  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    headers: req.headers,
    body: req.body,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logFn = res.statusCode >= 400 ? logger.warn : logger.info;

    logFn.call(logger, `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}
