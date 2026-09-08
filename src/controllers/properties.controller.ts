import { Response, NextFunction } from 'express';
import { propertiesService } from '../services/properties.service';
import { sendSuccess, sendCreated, sendPaginated, sendNoContent } from '../utils/response';
import { BadRequestError } from '../utils/errors';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { CreatePropertyInput, UpdatePropertyInput, PropertyQueryInput } from '../types/api.types';

/**
 * Properties controller — handles HTTP request/response for property operations.
 */
export class PropertiesController {
  /**
   * POST /api/v1/properties
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.uid;
      if (!companyId) {
        throw new BadRequestError('Company context required');
      }

      const input = req.body as CreatePropertyInput;
      const property = await propertiesService.create(companyId, input);
      sendCreated(res, property);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/properties
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.uid;
      if (!companyId) {
        throw new BadRequestError('Company context required');
      }

      const query = req.query as unknown as PropertyQueryInput;
      const result = await propertiesService.list(companyId, query);
      sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/properties/:id
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.uid;
      if (!companyId) {
        throw new BadRequestError('Company context required');
      }

      const property = await propertiesService.getById(String(req.params['id']), companyId);
      sendSuccess(res, property);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/properties/:id
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.uid;
      if (!companyId) {
        throw new BadRequestError('Company context required');
      }

      const input = req.body as UpdatePropertyInput;
      const property = await propertiesService.update(String(req.params['id']), companyId, input);
      sendSuccess(res, property);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/properties/:id
   */
  async archive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.user?.uid;
      if (!companyId) {
        throw new BadRequestError('Company context required');
      }

      await propertiesService.archive(String(req.params['id']), companyId);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export const propertiesController = new PropertiesController();
