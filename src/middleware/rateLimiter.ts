import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

/**
 * In-memory rate limiter middleware factory.
 * For production, replace with Redis-backed implementation.
 *
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests per window
 */
export function rateLimiter(
  windowMs: number = 60_000,
  maxRequests: number = 100,
) {
  const buckets = new Map<string, RateLimitBucket>();

  // Periodic cleanup to avoid memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now > bucket.resetTime) {
        buckets.delete(key);
      }
    }
  }, windowMs);

  // Prevent the interval from keeping the process alive
  cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key =
      req.ip ??
      req.headers['x-forwarded-for']?.toString() ??
      'unknown';

    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now > bucket.resetTime) {
      bucket = { count: 0, resetTime: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count++;

    // Set rate-limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - bucket.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(bucket.resetTime / 1000).toString());

    if (bucket.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetTime - now) / 1000).toString());
      next(new RateLimitError('Too many requests, please try again later'));
      return;
    }

    next();
  };
}
