import { Router } from 'express';
import { financialController } from '../controllers/financial.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Financial routes
 * Base path: /api/v1/financial
 */

router.get('/', authenticate, (req, res, next) => financialController.list(req, res, next));
router.get('/summary', authenticate, (req, res, next) => financialController.getSummary(req, res, next));
router.get('/depreciation', authenticate, (req, res, next) => financialController.getDepreciation(req, res, next));
router.get('/trust', authenticate, (req, res, next) => financialController.getTrustAccounts(req, res, next));
router.post('/payment-intent', authenticate, (req, res, next) => financialController.createPaymentIntent(req, res, next));
router.post('/refund', authenticate, (req, res, next) => financialController.refundPayment(req, res, next));
router.post('/connected-account', authenticate, (req, res, next) => financialController.createConnectedAccount(req, res, next));
router.post('/plaid/link-token', authenticate, (req, res, next) => financialController.createPlaidLinkToken(req, res, next));
router.post('/plaid/public-token', authenticate, (req, res, next) => financialController.exchangePlaidPublicToken(req, res, next));

export default router;
