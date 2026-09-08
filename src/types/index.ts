import { Request } from 'express';

/**
 * Authenticated request with user context.
 * Re-exported from auth middleware for convenience.
 */
export { AuthenticatedRequest } from '../middleware/auth';

/** Standard pagination query parameters */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Parsed pagination parameters with defaults applied */
export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

/**
 * Parse pagination query parameters with sensible defaults.
 */
export function parsePagination(query: PaginationQuery): PaginationParams {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 25));
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

/** Request with typed body */
export interface TypedRequest<T> extends Request {
  body: T;
}
