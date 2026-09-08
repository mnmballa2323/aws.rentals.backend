import { Router } from 'express';
import { propertiesController } from '../controllers/properties.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyQuerySchema,
  uuidParamSchema,
} from '../types/api.types';

const router = Router();

/**
 * Properties routes
 * Base path: /api/v1/properties
 */

router.get(
  '/',
  authenticate,
  validate(propertyQuerySchema, 'query'),
  (req, res, next) => propertiesController.list(req, res, next),
);

router.post(
  '/',
  authenticate,
  validate(createPropertySchema, 'body'),
  (req, res, next) => propertiesController.create(req, res, next),
);

router.get(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  (req, res, next) => propertiesController.getById(req, res, next),
);

router.patch(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  validate(updatePropertySchema, 'body'),
  (req, res, next) => propertiesController.update(req, res, next),
);

router.delete(
  '/:id',
  authenticate,
  validate(uuidParamSchema, 'params'),
  (req, res, next) => propertiesController.archive(req, res, next),
);

export default router;
