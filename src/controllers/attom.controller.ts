import { Request, Response, NextFunction } from 'express';
import { attomService } from '../services/attom.service';
import { sendSuccess } from '../utils/response';
import { BadRequestError } from '../utils/errors';

/**
 * ATTOM controller — exposes ATTOM Data API endpoints for the frontend.
 */
export class AttomController {
  /**
   * GET /api/v1/attom/property?address1=xxx&address2=xxx
   * Get property profile from ATTOM.
   */
  async getPropertyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = req.query as { address1?: string; address2?: string };
      if (!address1 || !address2) {
        throw new BadRequestError('address1 and address2 query params are required');
      }

      const data = await attomService.getPropertyExpandedProfile(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/avm?address1=xxx&address2=xxx
   * Get AVM valuation from ATTOM.
   */
  async getAvm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = req.query as { address1?: string; address2?: string };
      if (!address1 || !address2) {
        throw new BadRequestError('address1 and address2 query params are required');
      }

      const data = await attomService.getAvmByAddress(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/assessment?address1=xxx&address2=xxx
   * Get assessment/tax data from ATTOM.
   */
  async getAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = req.query as { address1?: string; address2?: string };
      if (!address1 || !address2) {
        throw new BadRequestError('address1 and address2 query params are required');
      }

      const data = await attomService.getAssessmentByAddress(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/sales-history?address1=xxx&address2=xxx
   * Get sale history from ATTOM.
   */
  async getSalesHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = req.query as { address1?: string; address2?: string };
      if (!address1 || !address2) {
        throw new BadRequestError('address1 and address2 query params are required');
      }

      const data = await attomService.getSaleHistoryByAddress(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/hazard?address1=xxx&address2=xxx
   * Get natural hazard data from ATTOM.
   */
  async getHazard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = req.query as { address1?: string; address2?: string };
      if (!address1 || !address2) {
        throw new BadRequestError('address1 and address2 query params are required');
      }

      const data = await attomService.getNaturalHazardByAddress(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/schools?address1=xxx&address2=xxx
   * Get nearby schools from ATTOM.
   */
  async getSchools(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = req.query as { address1?: string; address2?: string };
      if (!address1 || !address2) {
        throw new BadRequestError('address1 and address2 query params are required');
      }

      const data = await attomService.getSchoolsByAddress(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/enrichment?address1=xxx&address2=xxx
   * Get full property enrichment bundle from ATTOM.
   */
  async getFullEnrichment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = req.query as { address1?: string; address2?: string };
      if (!address1 || !address2) {
        throw new BadRequestError('address1 and address2 query params are required');
      }

      const data = await attomService.getFullPropertyEnrichment(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const attomController = new AttomController();
