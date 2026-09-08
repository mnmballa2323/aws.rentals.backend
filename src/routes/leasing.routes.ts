import { Router } from 'express';
import { leasingController } from '../controllers/leasing.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Leasing routes
 * Base path: /api/v1/leasing
 */

router.get('/', authenticate, (req, res, next) => leasingController.list(req, res, next));
router.post('/adverse-action', authenticate, (req, res, next) => leasingController.generateAdverseAction(req, res, next));
router.get('/lead-paint-check', authenticate, (req, res, next) => leasingController.checkLeadPaint(req, res, next));
router.post('/lead-paint-disclosure', authenticate, (req, res, next) => leasingController.generateLeadPaintDisclosure(req, res, next));
router.post('/validate-deposit', authenticate, (req, res, next) => leasingController.validateDeposit(req, res, next));
router.post('/validate-lease', authenticate, (req, res, next) => leasingController.validateLease(req, res, next));

export default router;
