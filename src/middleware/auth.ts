import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

/** Extends Express Request with authenticated user info */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

/**
 * Middleware that verifies Firebase ID tokens from the Authorization header.
 * Attaches decoded token info to req.user.
 *
 * Usage: router.get('/protected', authenticate, handler)
 */
export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    // Sandbox/Development bypass
    if (process.env.NODE_ENV !== 'production' || !req.app.get('firebase-initialized')) {
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
      
      let role = 'GENERAL';
      let email = 'user@example.com';
      let uid = 'mock-user-uid';

      // Detect role from mock token or referer port
      if (token.includes('tenant') || req.headers.referer?.includes('3001')) {
        role = 'TENANT';
        email = 'tenant@example.com';
        uid = 'mock-tenant-uid';
      } else if (token.includes('landlord') || token.includes('manager') || req.headers.referer?.includes('3002')) {
        role = 'MANAGER';
        email = 'manager@example.com';
        uid = 'mock-manager-uid';
      } else if (token.includes('owner') || req.headers.referer?.includes('3003')) {
        role = 'OWNER';
        email = 'owner@example.com';
        uid = 'mock-owner-uid';
      } else if (token.includes('admin') || req.headers.referer?.includes('3004')) {
        role = 'ADMIN';
        email = 'admin@example.com';
        uid = 'mock-admin-uid';
      }

      req.user = { uid, email, role };
      next();
      return;
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const idToken = authHeader.slice(7);

    if (!idToken) {
      throw new UnauthorizedError('Empty bearer token');
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: (decodedToken['role'] as string | undefined) ?? undefined,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    logger.warn('Token verification failed', { error });
    next(new UnauthorizedError('Invalid or expired token'));
  }
}

/**
 * Middleware factory that restricts access to users with specific roles.
 *
 * Usage: router.get('/admin', authenticate, authorize('SUPER_ADMIN', 'COMPANY_ADMIN'), handler)
 */
export function authorize(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!user.role || !allowedRoles.includes(user.role)) {
      next(new UnauthorizedError('Insufficient permissions'));
      return;
    }

    next();
  };
}
