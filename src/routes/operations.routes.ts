import { Router } from 'express';
import { operationsController } from '../controllers/operations.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Operations routes
 * Base path: /api/v1/operations
 */

router.get('/', authenticate, (req, res, next) => operationsController.list(req, res, next));

export default router;
