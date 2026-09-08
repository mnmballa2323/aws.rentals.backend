import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware.
 * Catches all errors passed to next() and returns a structured JSON response.
 * Must be registered LAST in the middleware chain.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Already sent headers — delegate to Express default
  if (res.headersSent) {
    _next(err);
    return;
  }

  // Known operational errors
  if (err instanceof ValidationError) {
    sendError(res, err.statusCode, err.code, err.message, err.errors);
    return;
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Non-operational error caught in handler', {
        message: err.message,
        stack: err.stack,
      });
    }
    sendError(res, err.statusCode, err.code, err.message);
    return;
  }

  // Prisma known request errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as Error & { code: string; meta?: Record<string, unknown> };
    switch (prismaErr.code) {
      case 'P2002':
        sendError(res, 409, 'CONFLICT', 'A record with this value already exists', prismaErr.meta);
        return;
      case 'P2025':
        sendError(res, 404, 'NOT_FOUND', 'Record not found');
        return;
      default:
        logger.error('Prisma error', { code: prismaErr.code, meta: prismaErr.meta });
        sendError(res, 500, 'DATABASE_ERROR', 'Database operation failed');
        return;
    }
  }

  // SyntaxError from JSON.parse (bad request body)
  if (err instanceof SyntaxError && 'body' in err) {
    sendError(res, 400, 'INVALID_JSON', 'Invalid JSON in request body');
    return;
  }

  // Unhandled errors
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    process.env['NODE_ENV'] === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  );
}
