import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/errors';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { CreateUnitInput, UpdateUnitInput } from '../types/api.types';

const prisma = new PrismaClient();

/**
 * Units controller — handles HTTP request/response for unit operations.
 */
export class UnitsController {
  /**
   * POST /api/v1/units
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateUnitInput;

      const unit = await prisma.unit.create({
        data: {
          propertyId: input.propertyId,
          unitNumber: input.unitNumber,
          beds: input.beds,
          baths: input.baths,
          sqft: input.sqft,
          floor: input.floor,
          marketRent: input.marketRent,
          currentRent: input.currentRent,
          amenities: input.amenities,
        },
      });

      sendCreated(res, unit);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/units?propertyId=xxx
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = req.query['propertyId'] as string | undefined;
      if (!propertyId) {
        throw new BadRequestError('propertyId query parameter is required');
      }

      const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 25));

      const [units, total] = await Promise.all([
        prisma.unit.findMany({
          where: { propertyId },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { unitNumber: 'asc' },
        }),
        prisma.unit.count({ where: { propertyId } }),
      ]);

      sendPaginated(res, units, {
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
   * GET /api/v1/units/:id
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const unit = await prisma.unit.findUnique({
        where: { id: String(req.params['id']) },
        include: {
          property: { select: { id: true, addressLine1: true, city: true, state: true } },
          leases: { where: { status: 'ACTIVE' }, take: 1 },
        },
      });

      if (!unit) {
        throw new NotFoundError(`Unit not found: ${req.params['id']}`);
      }

      sendSuccess(res, unit);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/units/:id
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as UpdateUnitInput;

      const unit = await prisma.unit.update({
        where: { id: String(req.params['id']) },
        data: input,
      });

      sendSuccess(res, unit);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/units/:id
   */
  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await prisma.unit.delete({ where: { id: String(req.params['id']) } });
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const unitsController = new UnitsController();
