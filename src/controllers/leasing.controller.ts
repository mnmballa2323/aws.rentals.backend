import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../utils/response';
import { screeningService } from '../services/screening.service';
import { complianceService } from '../services/compliance.service';

/**
 * Leasing controller — lease and adverse action management operations.
 */
export class LeasingController {
  /** GET /api/v1/leasing — List leases */
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      sendSuccess(res, [], 200, { message: 'Leasing endpoints active' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/leasing/adverse-action */
  async generateAdverseAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicantName, reasons } = req.body;
      const result = screeningService.generateAdverseActionNotice(
        applicantName || 'Applicant',
        reasons || ['Credit score below threshold'],
      );
      sendSuccess(res, result, 201, { message: 'Adverse Action Notice generated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/leasing/lead-paint-check */
  async checkLeadPaint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId } = req.query;
      if (!propertyId || typeof propertyId !== 'string') {
        res.status(400).json({ success: false, error: 'propertyId query parameter is required' });
        return;
      }
      const result = await complianceService.checkLeadPaintRequirement(propertyId);
      sendSuccess(res, result, 200, { message: 'Lead-Based Paint requirement checked successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/leasing/lead-paint-disclosure */
  async generateLeadPaintDisclosure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyName, address } = req.body;
      const result = complianceService.generateLeadPaintDisclosure(
        propertyName || 'Rental Property',
        address || 'Property Address',
      );
      sendSuccess(res, result, 201, { message: 'Lead-Based Paint Disclosure generated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/leasing/validate-deposit */
  async validateDeposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, depositAmount, monthlyRent } = req.body;
      if (!propertyId || depositAmount === undefined || monthlyRent === undefined) {
        res.status(400).json({ success: false, error: 'propertyId, depositAmount, and monthlyRent are required' });
        return;
      }
      const result = await complianceService.validateSecurityDeposit(
        propertyId,
        Number(depositAmount),
        Number(monthlyRent)
      );
      sendSuccess(res, result, 200, { message: 'Security deposit compliance validated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/leasing/validate-lease */
  async validateLease(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { propertyId, monthlyRent, depositAmount, lateFeeAmount } = req.body;
      if (!propertyId || monthlyRent === undefined || depositAmount === undefined || lateFeeAmount === undefined) {
        res.status(400).json({ success: false, error: 'propertyId, monthlyRent, depositAmount, and lateFeeAmount are required' });
        return;
      }
      const result = await complianceService.validateLeaseTerms(propertyId, {
        monthlyRent: Number(monthlyRent),
        depositAmount: Number(depositAmount),
        lateFeeAmount: Number(lateFeeAmount)
      });
      sendSuccess(res, result, 200, { message: 'Lease terms validated against USA jurisdiction rules successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const leasingController = new LeasingController();
