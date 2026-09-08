import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, uuidParamSchema } from '../types/api.types';

const router = Router();

/**
 * Users routes
 * Base path: /api/v1/users
 */

router.get(
  '/me',
  authenticate,
  (req, res, next) => usersController.getMe(req, res, next),
);

router.get(
  '/me/notifications',
  authenticate,
  (req, res, next) => usersController.getNotifications(req, res, next),
);

router.patch(
  '/me/notifications/:id/read',
  authenticate,
  (req, res, next) => usersController.markNotificationRead(req, res, next),
);

router.get(
  '/',
  authenticate,
  (req, res, next) => usersController.list(req, res, next),
);

router.post(
  '/',
  authenticate,
  validate(createUserSchema, 'body'),
  (req, res, next) => usersController.create(req, res, next),
);

router.get(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  (req, res, next) => usersController.getById(req, res, next),
);

router.patch(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  (req, res, next) => usersController.update(req, res, next),
);

export default router;
