import { Request, Response, NextFunction } from 'express';
import { attomService } from '../services/attom.service';
import { sendSuccess } from '../utils/response';

function parseAddressParams(query: any): { address1: string; address2: string } {
  let address1 = (query.address1 || query.address || query.street || '1204 San Antonio St') as string;
  let address2 = query.address2 as string;
  if (!address2) {
    const city = query.city || 'Austin';
    const state = query.state || 'TX';
    const zip = query.zip || '78701';
    address2 = `${city}, ${state} ${zip}`.trim();
  }
  return { address1, address2 };
}

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
      const { address1, address2 } = parseAddressParams(req.query);
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
      const { address1, address2 } = parseAddressParams(req.query);
      const data = await attomService.getAvmByAddress(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/rental-avm?address1=xxx&address2=xxx
   * Get Rental AVM valuation from ATTOM.
   */
  async getRentalAvm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = parseAddressParams(req.query);
      const data = await attomService.getRentalAvmByAddress(address1, address2);
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
      const { address1, address2 } = parseAddressParams(req.query);
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
      const { address1, address2 } = parseAddressParams(req.query);
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
      const { address1, address2 } = parseAddressParams(req.query);
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
      const { address1, address2 } = parseAddressParams(req.query);
      const data = await attomService.getSchoolsByAddress(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/attom/building-permits?address1=xxx&address2=xxx
   * Get municipal building permits from ATTOM.
   */
  async getBuildingPermits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { address1, address2 } = parseAddressParams(req.query);
      const data = await attomService.getBuildingPermitsByAddress(address1, address2);
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
      const { address1, address2 } = parseAddressParams(req.query);
      const data = await attomService.getFullPropertyEnrichment(address1, address2);
      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const attomController = new AttomController();
