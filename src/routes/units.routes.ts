import { Router } from 'express';
import { unitsController } from '../controllers/units.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUnitSchema, updateUnitSchema, uuidParamSchema } from '../types/api.types';

const router = Router();

/**
 * Units routes
 * Base path: /api/v1/units
 */

router.get(
  '/',
  authenticate,
  (req, res, next) => unitsController.list(req, res, next),
);

router.post(
  '/',
  authenticate,
  validate(createUnitSchema, 'body'),
  (req, res, next) => unitsController.create(req, res, next),
);

router.get(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  (req, res, next) => unitsController.getById(req, res, next),
);

router.patch(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  validate(updateUnitSchema, 'body'),
  (req, res, next) => unitsController.update(req, res, next),
);

router.delete(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  (req, res, next) => unitsController.remove(req, res, next),
);

export default router;
