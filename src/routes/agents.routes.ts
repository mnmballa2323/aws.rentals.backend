import { Router } from 'express';
import { agentsController } from '../controllers/agents.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * AI Agents Management & Dispatch routes
 * Base path: /api/v1/agents
 */

router.get(
  '/',
  authenticate,
  (req, res, next) => agentsController.list(req, res, next),
);

router.post(
  '/chat',
  authenticate,
  (req, res, next) => agentsController.chat(req, res, next),
);

export default router;
