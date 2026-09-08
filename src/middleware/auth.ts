import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

/** Extends Express Request with authenticated user info */
export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    uid: string;
    email?: string;
    role?: string;
  };
}

// Initialize AWS Cognito JWT Verifier if configured
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cognitoVerifier: any = null;
if (config.aws.cognitoUserPoolId && config.aws.cognitoClientId) {
  cognitoVerifier = CognitoJwtVerifier.create({
    userPoolId: config.aws.cognitoUserPoolId,
    tokenUse: 'id',
    clientId: config.aws.cognitoClientId,
  });
}

/**
 * Middleware that verifies AWS Cognito ID tokens from the Authorization header.
 * Attaches decoded user info (sub, email, role) to req.user.
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

    // Development / Sandbox bypass when Cognito is not configured
    if (process.env['NODE_ENV'] !== 'production' || !req.app.get('cognito-configured') || !cognitoVerifier) {
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';

      let role = 'GENERAL';
      let email = 'user@aws.rentals';
      let uid = 'mock-aws-user-id';

      // Detect role from token or referrer header port
      if (token.includes('tenant') || req.headers.referer?.includes('3001')) {
        role = 'TENANT';
        email = 'tenant@aws.rentals';
        uid = 'tenant-us-east-1-001';
      } else if (token.includes('landlord') || token.includes('manager') || req.headers.referer?.includes('3005') || req.headers.referer?.includes('3002')) {
        role = 'MANAGER';
        email = 'manager@aws.rentals';
        uid = 'manager-us-east-1-001';
      } else if (token.includes('owner') || req.headers.referer?.includes('3003')) {
        role = 'OWNER';
        email = 'owner@aws.rentals';
        uid = 'owner-us-east-1-001';
      } else if (token.includes('admin') || req.headers.referer?.includes('3004')) {
        role = 'ADMIN';
        email = 'admin@aws.rentals';
        uid = 'admin-us-east-1-001';
      }

      req.user = { sub: uid, uid, email, role };
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

    const payload = await cognitoVerifier.verify(idToken);

    req.user = {
      sub: payload.sub,
      uid: payload.sub,
      email: payload.email as string | undefined,
      role: (payload['custom:role'] as string | undefined) ?? (payload['role'] as string | undefined) ?? 'TENANT',
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    logger.warn('AWS Cognito token verification failed', { error });
    next(new UnauthorizedError('Invalid or expired AWS Cognito token'));
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
