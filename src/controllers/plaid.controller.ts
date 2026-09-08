import { Request, Response, NextFunction } from 'express';
import { plaidService } from '../services/plaid.service';
import { sendSuccess } from '../utils/response';

export class PlaidController {
  /**
   * POST /api/v1/plaid/link-token
   * Create Link Token for frontend Plaid Link modal
   */
  async createLinkToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.body.userId as string) || 'tenant-usr-demo';
      const clientName = (req.body.clientName as string) || 'AWS Rentals';
      const products = (req.body.products as string[]) || ['auth', 'transactions', 'identity', 'assets'];

      const result = await plaidService.createLinkToken(userId, clientName, products);
      sendSuccess(res, result, 200, { message: 'Plaid link token generated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/plaid/exchange-public-token
   * Exchange public_token for access_token and item_id
   */
  async exchangePublicToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { publicToken } = req.body;
      const result = await plaidService.exchangePublicToken(publicToken || 'public-sandbox-mock');
      sendSuccess(res, result, 200, { message: 'Plaid public token exchanged successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plaid/item
   * Fetch connected Item status and health
   */
  async getItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const item = await plaidService.getItem(accessToken);
      sendSuccess(res, item, 200, { message: 'Plaid item retrieved' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/plaid/item
   * Disconnect and remove Plaid item
   */
  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.body.accessToken as string) || (req.query.accessToken as string) || 'access-sandbox-mock';
      const result = await plaidService.removeItem(accessToken);
      sendSuccess(res, result, 200, { message: 'Plaid item disconnected' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plaid/auth
   * Fetch bank account and ACH routing numbers
   */
  async getAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const auth = await plaidService.getAuth(accessToken);
      sendSuccess(res, auth, 200, { message: 'Plaid bank auth data retrieved' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plaid/balance
   * Real-time balance check for pre-debit NSF validation
   */
  async getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const accountIds = req.query.accountIds ? (req.query.accountIds as string).split(',') : undefined;
      const balances = await plaidService.getBalance(accessToken, accountIds);
      sendSuccess(res, balances, 200, { message: 'Real-time account balances retrieved' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plaid/identity
   * Legal names, addresses, and KYC identity verification
   */
  async getIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const identity = await plaidService.getIdentity(accessToken);
      sendSuccess(res, identity, 200, { message: 'Plaid identity retrieved' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/plaid/transactions/sync
   * Incremental banking ledger sync
   */
  async syncTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.body.accessToken as string) || 'access-sandbox-mock';
      const cursor = req.body.cursor as string | undefined;
      const count = req.body.count ? Number(req.body.count) : 100;

      const syncResult = await plaidService.syncTransactions(accessToken, cursor, count);
      sendSuccess(res, syncResult, 200, { message: 'Plaid transactions synced successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/plaid/signal/evaluate
   * Predictive ACH return risk and fraud scoring
   */
  async evaluateSignal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.body.accessToken as string) || 'access-sandbox-mock';
      const accountId = (req.body.accountId as string) || 'act_mock_001';
      const amount = Number(req.body.amount || 2850);
      const clientTransactionId = req.body.clientTransactionId as string | undefined;

      const evaluation = await plaidService.evaluateSignal(accessToken, accountId, amount, clientTransactionId);
      sendSuccess(res, evaluation, 200, { message: 'Plaid Signal return risk evaluated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/plaid/assets/create
   * Generate underwriting asset report
   */
  async createAssetReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessTokens = (req.body.accessTokens as string[]) || ['access-sandbox-mock'];
      const daysRequested = req.body.daysRequested ? Number(req.body.daysRequested) : 90;

      const reportToken = await plaidService.createAssetReport(accessTokens, daysRequested);
      sendSuccess(res, reportToken, 200, { message: 'Asset report generation initiated' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plaid/assets/report
   * Fetch generated asset report
   */
  async getAssetReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.query.assetReportToken as string) || 'assets-sandbox-mock';
      const report = await plaidService.getAssetReport(token);
      sendSuccess(res, report, 200, { message: 'Asset report retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plaid/income
   * Payroll income verification (W-2s, 1099s, paystubs)
   */
  async getPayrollIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const income = await plaidService.getPayrollIncome(accessToken);
      sendSuccess(res, income, 200, { message: 'Plaid payroll income verified' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/plaid/liabilities
   * Debt obligations and liabilities for DTI
   */
  async getLiabilities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const liabilities = await plaidService.getLiabilities(accessToken);
      sendSuccess(res, liabilities, 200, { message: 'Plaid liabilities retrieved' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/plaid/processor-token
   * Create Modern Treasury processor token
   */
  async createProcessorToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.body.accessToken as string) || 'access-sandbox-mock';
      const accountId = (req.body.accountId as string) || 'act_mock_001';
      const processor = (req.body.processor as string) || 'modern_treasury';

      const result = await plaidService.createProcessorToken(accessToken, accountId, processor);
      sendSuccess(res, result, 200, { message: 'Plaid processor token created for Modern Treasury' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/plaid/webhook
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await plaidService.handleWebhook(req.body);
      sendSuccess(res, result, 200, { message: 'Plaid webhook processed' });
    } catch (error) {
      next(error);
    }
  }
}

export const plaidController = new PlaidController();
