import { Router } from 'express';
import { attomController } from '../controllers/attom.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * ATTOM Data API routes
 * Base path: /api/v1/attom
 */

router.get('/property', authenticate, (req, res, next) => attomController.getPropertyProfile(req, res, next));
router.get('/avm', authenticate, (req, res, next) => attomController.getAvm(req, res, next));
router.get('/rental-avm', authenticate, (req, res, next) => attomController.getRentalAvm(req, res, next));
router.get('/assessment', authenticate, (req, res, next) => attomController.getAssessment(req, res, next));
router.get('/sales-history', authenticate, (req, res, next) => attomController.getSalesHistory(req, res, next));
router.get('/hazard', authenticate, (req, res, next) => attomController.getHazard(req, res, next));
router.get('/schools', authenticate, (req, res, next) => attomController.getSchools(req, res, next));
router.get('/building-permits', authenticate, (req, res, next) => attomController.getBuildingPermits(req, res, next));
router.get('/enrichment', (req, res, next) => attomController.getFullEnrichment(req, res, next));

export default router;
