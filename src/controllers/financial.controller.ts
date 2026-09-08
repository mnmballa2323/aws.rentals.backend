import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess } from '../utils/response';
import { paymentService } from '../services/payment.service';
import { financialService } from '../services/financial.service';

const prisma = new PrismaClient();

/**
 * Financial controller — operations for rent payments and account disbursements.
 */
export class FinancialController {
  /** GET /api/v1/financial — List transactions */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.query.companyId as string;
      const ledger = await financialService.getLedger(companyId);
      sendSuccess(res, ledger, 200, { message: 'Transaction ledger retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/financial/summary — P&L accounting summary */
  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = req.query.propertyId as string;
      const summary = await financialService.getSummary(propertyId);
      sendSuccess(res, summary, 200, { message: 'P&L summary calculated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/financial/depreciation — MACRS furnished asset depreciation */
  async getDepreciation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const furnishingCostVal = req.query.cost ? Number(req.query.cost) : undefined;
      const schedules = financialService.getDepreciation(furnishingCostVal);
      sendSuccess(res, schedules, 200, { message: 'MACRS furnished furniture depreciation schedules calculated' });
    } catch (error) {
      next(error);
    }
  }

  /** GET /api/v1/financial/trust — Trust account and interest-bearing escrow logs */
  async getTrustAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const companyId = req.query.companyId as string;
      const accounts = await financialService.getTrustAccounts(companyId);
      sendSuccess(res, accounts, 200, { message: 'Trust accounts retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/financial/payment-intent */
  async createPaymentIntent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { amount, currency, metadata, companyId, propertyId, unitId, leaseId, tenantUserId } = req.body;
      
      // Enforce MTR 10% Platform Commission
      const amountCents = amount || 0;
      const commissionCents = Math.floor(amountCents * 0.10);
      const payoutCents = amountCents - commissionCents;

      const result = await paymentService.createPaymentIntent(
        amountCents,
        currency || 'usd',
        {
          ...(metadata || {}),
          commissionCents: commissionCents.toString(),
          payoutCents: payoutCents.toString(),
          paymentType: 'ACH_ONLY_MTR',
        },
      );

      // Save Transaction & Payment to database for trust auditing
      if (companyId) {
        try {
          // Gross Rent Transaction (100% INCOME)
          const grossTx = await prisma.transaction.create({
            data: {
              company: { connect: { id: companyId } },
              property: propertyId ? { connect: { id: propertyId } } : undefined,
              unit: unitId ? { connect: { id: unitId } } : undefined,
              lease: leaseId ? { connect: { id: leaseId } } : undefined,
              type: 'INCOME',
              category: 'RENT',
              amount: (amountCents / 100).toFixed(2),
              description: 'Gross MTR stay booking payment (ACH Only)',
              status: 'PENDING',
              paymentMethod: 'ACH',
              externalId: result.paymentIntentId,
              date: new Date(),
            }
          });

          // 10% Platform Commission Fee Transaction (EXPENSE for landlord)
          await prisma.transaction.create({
            data: {
              company: { connect: { id: companyId } },
              property: propertyId ? { connect: { id: propertyId } } : undefined,
              unit: unitId ? { connect: { id: unitId } } : undefined,
              lease: leaseId ? { connect: { id: leaseId } } : undefined,
              type: 'EXPENSE',
              category: 'MANAGEMENT_FEE',
              amount: (commissionCents / 100).toFixed(2),
              description: 'Platform 10% booking commission fee (ACH Split)',
              status: 'PENDING',
              paymentMethod: 'ACH',
              externalId: result.paymentIntentId,
              date: new Date(),
            }
          });

          // Save the tenant's Payment record
          if (tenantUserId) {
            await prisma.payment.create({
              data: {
                transactionId: grossTx.id,
                tenantUserId,
                amount: (amountCents / 100).toFixed(2),
                method: 'ACH',
                stripePaymentId: result.paymentIntentId,
                status: 'PENDING',
              }
            });
          }
        } catch (dbErr) {
          console.error('Failed to log transactions in DB, proceeding with Stripe/Mock result:', dbErr);
        }
      }

      sendSuccess(res, {
        ...result,
        amountCents,
        commissionCents,
        payoutCents,
        commissionPercent: 10,
        paymentMethod: 'ACH_ONLY',
      }, 201, { message: 'Payment intent created successfully with 10% platform commission' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/financial/refund */
  async refundPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentIntentId, amount } = req.body;
      const result = await paymentService.refundPayment(paymentIntentId, amount);
      sendSuccess(res, result, 200, { message: 'Refund processed successfully' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/financial/connected-account */
  async createConnectedAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, metadata } = req.body;
      const result = await paymentService.createConnectedAccount(email, metadata || {});
      sendSuccess(res, result, 201, { message: 'Connected express account created' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/financial/plaid/link-token */
  async createPlaidLinkToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const result = await paymentService.createPlaidLinkToken(userId || 'unknown');
      sendSuccess(res, result, 201, { message: 'Link token created' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /api/v1/financial/plaid/public-token */
  async exchangePlaidPublicToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { publicToken, userId } = req.body;
      const result = await paymentService.exchangePlaidPublicToken(publicToken, userId || 'unknown');
      sendSuccess(res, result, 200, { message: 'Public token exchanged successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const financialController = new FinancialController();
