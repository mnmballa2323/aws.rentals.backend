import { Router } from 'express';
import { plaidController } from '../controllers/plaid.controller';

const router = Router();

// Link & Token Management
router.post('/link-token', (req, res, next) => plaidController.createLinkToken(req, res, next));
router.get('/link-token', (req, res, next) => plaidController.getLinkToken(req, res, next));
router.post('/exchange-public-token', (req, res, next) => plaidController.exchangePublicToken(req, res, next));
router.post('/access-token/invalidate', (req, res, next) => plaidController.invalidateAccessToken(req, res, next));
router.get('/item', (req, res, next) => plaidController.getItem(req, res, next));
router.delete('/item', (req, res, next) => plaidController.removeItem(req, res, next));

// Banking Core (Accounts, Auth, Balances)
router.get('/accounts', (req, res, next) => plaidController.getAccounts(req, res, next));
router.get('/auth', (req, res, next) => plaidController.getAuth(req, res, next));
router.get('/balance', (req, res, next) => plaidController.getBalance(req, res, next));

// Identity & KYC Matching
router.get('/identity', (req, res, next) => plaidController.getIdentity(req, res, next));
router.post('/identity/match', (req, res, next) => plaidController.matchIdentity(req, res, next));

// Transactions & Recurring Cash Flows
router.post('/transactions/sync', (req, res, next) => plaidController.syncTransactions(req, res, next));
router.get('/transactions/recurring', (req, res, next) => plaidController.getRecurringTransactions(req, res, next));

// Plaid Signal (Return Risk, Fraud Probability, Reporting)
router.post('/signal/evaluate', (req, res, next) => plaidController.evaluateSignal(req, res, next));
router.post('/signal/decision/report', (req, res, next) => plaidController.reportSignalDecision(req, res, next));

// Asset Reports & Proof of Funds
router.post('/assets/create', (req, res, next) => plaidController.createAssetReport(req, res, next));
router.get('/assets/report', (req, res, next) => plaidController.getAssetReport(req, res, next));
router.post('/assets/refresh', (req, res, next) => plaidController.refreshAssetReport(req, res, next));
router.get('/assets/pdf', (req, res, next) => plaidController.getAssetReportPdf(req, res, next));
router.post('/assets/relay-token', (req, res, next) => plaidController.createRelayToken(req, res, next));

// Payroll Income, Risk Signals & Liabilities (DTI)
router.get('/income', (req, res, next) => plaidController.getPayrollIncome(req, res, next));
router.get('/income/risk-signals', (req, res, next) => plaidController.getIncomeRiskSignals(req, res, next));
router.get('/liabilities', (req, res, next) => plaidController.getLiabilities(req, res, next));

// OFAC / AML Watchlist Screening
router.post('/watchlist/screening', (req, res, next) => plaidController.createWatchlistScreening(req, res, next));
router.get('/watchlist/screening/:id', (req, res, next) => plaidController.getWatchlistScreening(req, res, next));

// Modern Treasury Bridge
router.post('/processor-token', (req, res, next) => plaidController.createProcessorToken(req, res, next));

// Webhooks
router.post('/webhook', (req, res, next) => plaidController.handleWebhook(req, res, next));

export default router;
