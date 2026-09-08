import { Router } from 'express';
import { plaidController } from '../controllers/plaid.controller';

const router = Router();

// Link and Token Management
router.post('/link-token', (req, res, next) => plaidController.createLinkToken(req, res, next));
router.post('/exchange-public-token', (req, res, next) => plaidController.exchangePublicToken(req, res, next));
router.get('/item', (req, res, next) => plaidController.getItem(req, res, next));
router.delete('/item', (req, res, next) => plaidController.removeItem(req, res, next));

// Banking Core
router.get('/auth', (req, res, next) => plaidController.getAuth(req, res, next));
router.get('/balance', (req, res, next) => plaidController.getBalance(req, res, next));
router.get('/identity', (req, res, next) => plaidController.getIdentity(req, res, next));
router.post('/transactions/sync', (req, res, next) => plaidController.syncTransactions(req, res, next));

// Advanced Underwriting & Risk (Signal, Assets, Income, Liabilities)
router.post('/signal/evaluate', (req, res, next) => plaidController.evaluateSignal(req, res, next));
router.post('/assets/create', (req, res, next) => plaidController.createAssetReport(req, res, next));
router.get('/assets/report', (req, res, next) => plaidController.getAssetReport(req, res, next));
router.get('/income', (req, res, next) => plaidController.getPayrollIncome(req, res, next));
router.get('/liabilities', (req, res, next) => plaidController.getLiabilities(req, res, next));

// Modern Treasury Bridge
router.post('/processor-token', (req, res, next) => plaidController.createProcessorToken(req, res, next));

// Webhook
router.post('/webhook', (req, res, next) => plaidController.handleWebhook(req, res, next));

export default router;
