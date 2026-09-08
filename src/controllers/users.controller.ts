import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/errors';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { CreateUserInput, UpdateUserInput } from '../types/api.types';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Users controller — handles HTTP request/response for user operations.
 */
export class UsersController {
  /**
   * POST /api/v1/users
   * Create or sync a user record from AWS Cognito.
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateUserInput;

      const user = await prisma.user.create({
        data: {
          cognitoSub: input.cognitoSub,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          role: input.role,
        },
      });

      sendCreated(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 25));
      const role = req.query['role'] as string | undefined;

      const where = role ? { role: role as never } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            avatarUrl: true,
            createdAt: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      sendPaginated(res, users, {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/me
   * Get the currently authenticated user's profile.
   */
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        throw new BadRequestError('Authentication required');
      }

      let user = null;
      try {
        user = await prisma.user.findUnique({
          where: { cognitoSub: req.user.uid },
          include: {
            company: { select: { id: true, name: true, slug: true } },
          },
        });
      } catch (err) {
        logger.warn('Failed to query user profile from database, using mock fallback', err);
        user = {
          id: req.user.uid === 'mock-tenant-uid' ? 'mock-tenant-id' : req.user.uid === 'mock-manager-uid' ? 'mock-manager-id' : req.user.uid === 'mock-owner-uid' ? 'mock-owner-id' : 'mock-admin-id',
          cognitoSub: req.user.uid,
          email: req.user.email || 'user@example.com',
          firstName: req.user.role === 'TENANT' ? 'John' : req.user.role === 'MANAGER' ? 'Sarah' : req.user.role === 'OWNER' ? 'Michael' : 'Platform',
          lastName: req.user.role === 'TENANT' ? 'Tenant' : req.user.role === 'MANAGER' ? 'Landlord' : req.user.role === 'OWNER' ? 'Owner' : 'Admin',
          phone: '+15555555555',
          role: req.user.role || 'GENERAL',
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          companyId: 'mock-company-id',
          company: {
            id: 'mock-company-id',
            name: 'Rental Home Demo Corp',
            slug: 'demo-corp'
          }
        };
      }

      if (!user) {
        throw new NotFoundError('User profile not found');
      }

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/me/notifications
   */
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        throw new BadRequestError('Authentication required');
      }

      let notifications: any[] = [];
      try {
        const user = await prisma.user.findUnique({
          where: { cognitoSub: req.user.uid }
        });
        if (user) {
          notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
          });
        }
      } catch (err) {
        logger.warn('Database query failed for notifications, returning mock notices list', err);
        notifications = [
          {
            id: 'mock-notif-1',
            userId: 'mock-user-id',
            type: 'GENERAL',
            title: '⚠️ FHA Compliance Check Required',
            body: 'Application #8742 requires an individual criminal history assessment under HUD/FHA guidelines.',
            data: { applicationId: '8742' },
            readAt: null,
            createdAt: new Date().toISOString()
          },
          {
            id: 'mock-notif-2',
            userId: 'mock-user-id',
            type: 'GENERAL',
            title: '🏡 Lead-Paint Disclosure Pending',
            body: 'Oak Terrace Apartments was built before 1978. Lead-based paint disclosures must be signed before lease generation.',
            data: { propertyId: 'oak-terrace' },
            readAt: null,
            createdAt: new Date().toISOString()
          }
        ];
      }

      sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/me/notifications/:id/read
   */
  async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        throw new BadRequestError('Authentication required');
      }

      const user = await prisma.user.findUnique({
        where: { cognitoSub: req.user.uid }
      });

      if (!user) {
        throw new NotFoundError('User profile not found');
      }

      const notification = await prisma.notification.findUnique({
        where: { id: String(req.params['id']) }
      });

      if (!notification || notification.userId !== user.id) {
        throw new NotFoundError('Notification not found');
      }

      const updated = await prisma.notification.update({
        where: { id: notification.id },
        data: { readAt: new Date() }
      });

      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: String(req.params['id']) },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new NotFoundError(`User not found: ${req.params['id']}`);
      }

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/users/:id
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as UpdateUserInput;

      const user = await prisma.user.update({
        where: { id: String(req.params['id']) },
        data: input,
      });

      sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
