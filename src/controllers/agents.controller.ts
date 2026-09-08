import { Response, NextFunction } from 'express';
import { agentService } from '../services/agent.service';
import { sendSuccess } from '../utils/response';
import { BadRequestError } from '../utils/errors';
import type { AuthenticatedRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class AgentsController {
  /**
   * GET /api/v1/agents
   * List agents with live status and simulated task counters.
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        throw new BadRequestError('Authentication required');
      }

      let companyId = 'mock-company-id';
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid: req.user.uid }
        });
        if (user) {
          companyId = user.companyId || 'mock-company-id';
        }
      } catch (err) {
        logger.warn('Failed to query user profile from database in list, using mock companyId fallback', err);
      }

      const agents = await agentService.listAgents(companyId);
      sendSuccess(res, agents);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/agents/chat
   * Dispatches conversation/command message to the selected agent and triggers database actions if triaged.
   */
  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.uid) {
        throw new BadRequestError('Authentication required');
      }

      const { agentId, message } = req.body;
      if (!agentId || !message) {
        throw new BadRequestError('agentId and message parameters are required');
      }

      let companyId = 'mock-company-id';
      let userId = 'mock-user-id';
      try {
        const user = await prisma.user.findUnique({
          where: { firebaseUid: req.user.uid }
        });
        if (user) {
          companyId = user.companyId || 'mock-company-id';
          userId = user.id;
        }
      } catch (err) {
        logger.warn('Failed to query user profile from database in chat, using mock fallback details', err);
      }

      const dispatchResult = await agentService.dispatch(userId, companyId, agentId, message);
      sendSuccess(res, dispatchResult);
    } catch (error) {
      next(error);
    }
  }
}

export const agentsController = new AgentsController();
