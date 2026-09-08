import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';

/**
 * Operations controller — placeholder for maintenance/work order operations.
 */
export class OperationsController {
  /** GET /api/v1/operations — List work orders */
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, [], 200, { message: 'Operations endpoints coming soon' });
    } catch (error) {
      next(error);
    }
  }
}

export const operationsController = new OperationsController();
