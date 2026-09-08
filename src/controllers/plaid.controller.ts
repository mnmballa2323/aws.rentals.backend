import { Request, Response, NextFunction } from 'express';
import { plaidService } from '../services/plaid.service';
import { sendSuccess } from '../utils/response';

export class PlaidController {
  // ─── Link & Tokens ──────────────────────────────────────────

  async createLinkToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req.body.userId as string) || 'tenant-usr-demo';
      const clientName = (req.body.clientName as string) || 'AWS Rentals';
      const products = (req.body.products as string[]) || ['auth', 'transactions', 'identity', 'assets', 'liabilities'];

      const result = await plaidService.createLinkToken(userId, clientName, products);
      sendSuccess(res, result, 200, { message: 'Plaid link token generated' });
    } catch (error) {
      next(error);
    }
  }

  async getLinkToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const linkToken = (req.query.linkToken as string) || 'link-sandbox-demo';
      const result = await plaidService.getLinkToken(linkToken);
      sendSuccess(res, result, 200, { message: 'Plaid link token retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async exchangePublicToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { publicToken } = req.body;
      const result = await plaidService.exchangePublicToken(publicToken || 'public-sandbox-mock');
      sendSuccess(res, result, 200, { message: 'Plaid public token exchanged successfully' });
    } catch (error) {
      next(error);
    }
  }

  async invalidateAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.body.accessToken as string) || 'access-sandbox-mock';
      const result = await plaidService.invalidateAccessToken(accessToken);
      sendSuccess(res, result, 200, { message: 'Plaid access token rotated' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Item & Accounts ────────────────────────────────────────

  async getItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const item = await plaidService.getItem(accessToken);
      sendSuccess(res, item, 200, { message: 'Plaid item retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.body.accessToken as string) || (req.query.accessToken as string) || 'access-sandbox-mock';
      const result = await plaidService.removeItem(accessToken);
      sendSuccess(res, result, 200, { message: 'Plaid item disconnected' });
    } catch (error) {
      next(error);
    }
  }

  async getAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const accounts = await plaidService.getAccounts(accessToken);
      sendSuccess(res, accounts, 200, { message: 'Plaid accounts retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async getAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const auth = await plaidService.getAuth(accessToken);
      sendSuccess(res, auth, 200, { message: 'Plaid bank auth data retrieved' });
    } catch (error) {
      next(error);
    }
  }

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

  // ─── Identity & Match Verification ──────────────────────────

  async getIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const identity = await plaidService.getIdentity(accessToken);
      sendSuccess(res, identity, 200, { message: 'Plaid identity retrieved' });
    } catch (error) {
      next(error);
    }
  }

  async matchIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.body.accessToken as string) || 'access-sandbox-mock';
      const { legalName, phoneNumber, email, address } = req.body;
      const match = await plaidService.matchIdentity(accessToken, {
        legalName: legalName || 'Michael Meram',
        phoneNumber,
        email,
        address,
      });
      sendSuccess(res, match, 200, { message: 'Identity KYC matching scores calculated' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Transactions & Recurring Streams ───────────────────────

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

  async getRecurringTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const recurring = await plaidService.getRecurringTransactions(accessToken);
      sendSuccess(res, recurring, 200, { message: 'Recurring payroll and rent streams extracted' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Plaid Signal (ML Return & Fraud Risk) ───────────────────

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

  async reportSignalDecision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clientTransactionId, decision, outcome } = req.body;
      const result = await plaidService.reportSignalDecision(
        clientTransactionId || 'sig_tx_001',
        decision || 'APPROVE',
        outcome,
      );
      sendSuccess(res, result, 200, { message: 'Signal decision outcome reported to Plaid ML' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Asset Reports ──────────────────────────────────────────

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

  async getAssetReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.query.assetReportToken as string) || 'assets-sandbox-mock';
      const report = await plaidService.getAssetReport(token);
      sendSuccess(res, report, 200, { message: 'Asset report retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async refreshAssetReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.body.assetReportToken as string) || 'assets-sandbox-mock';
      const daysRequested = req.body.daysRequested ? Number(req.body.daysRequested) : 90;
      const refreshed = await plaidService.refreshAssetReport(token, daysRequested);
      sendSuccess(res, refreshed, 200, { message: 'Asset report refreshed' });
    } catch (error) {
      next(error);
    }
  }

  async getAssetReportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = (req.query.assetReportToken as string) || 'assets-sandbox-mock';
      const pdf = await plaidService.getAssetReportPdf(token);
      sendSuccess(res, pdf, 200, { message: 'Asset report PDF prepared' });
    } catch (error) {
      next(error);
    }
  }

  async createRelayToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assetReportToken, secondaryClientId } = req.body;
      const relay = await plaidService.createRelayToken(assetReportToken, secondaryClientId);
      sendSuccess(res, relay, 200, { message: 'Asset report relay token created' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Payroll Income, Risk Signals & Liabilities ─────────────

  async getPayrollIncome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const income = await plaidService.getPayrollIncome(accessToken);
      sendSuccess(res, income, 200, { message: 'Plaid payroll income verified' });
    } catch (error) {
      next(error);
    }
  }

  async getIncomeRiskSignals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const signals = await plaidService.getIncomeRiskSignals(accessToken);
      sendSuccess(res, signals, 200, { message: 'Income tampering risk signals evaluated' });
    } catch (error) {
      next(error);
    }
  }

  async getLiabilities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = (req.query.accessToken as string) || 'access-sandbox-mock';
      const liabilities = await plaidService.getLiabilities(accessToken);
      sendSuccess(res, liabilities, 200, { message: 'Plaid liabilities retrieved' });
    } catch (error) {
      next(error);
    }
  }

  // ─── OFAC / AML Watchlist Screening ─────────────────────────

  async createWatchlistScreening(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, dateOfBirth, document, address } = req.body;
      const screening = await plaidService.createWatchlistScreening({
        name: name || 'Michael Meram',
        dateOfBirth,
        document,
        address,
      });
      sendSuccess(res, screening, 201, { message: 'Watchlist AML screening executed' });
    } catch (error) {
      next(error);
    }
  }

  async getWatchlistScreening(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const screening = await plaidService.getWatchlistScreening(req.params.id as string);
      sendSuccess(res, screening, 200, { message: 'Watchlist screening report retrieved' });
    } catch (error) {
      next(error);
    }
  }

  // ─── Modern Treasury Processor Bridge ───────────────────────

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

  // ─── Webhooks ───────────────────────────────────────────────

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
