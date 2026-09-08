import { Router } from 'express';
import propertiesRoutes from './properties.routes';
import unitsRoutes from './units.routes';
import usersRoutes from './users.routes';
import leasingRoutes from './leasing.routes';
import financialRoutes from './financial.routes';
import operationsRoutes from './operations.routes';
import attomRoutes from './attom.routes';
import agentsRoutes from './agents.routes';
import plaidRoutes from './plaid.routes';
import modernTreasuryRoutes from './modernTreasury.routes';
import mapboxRoutes from './mapbox.routes';

const router = Router();

/**
 * API v1 route aggregator.
 * All routes are prefixed with /api/v1 in app.ts.
 */

router.use('/properties', propertiesRoutes);
router.use('/units', unitsRoutes);
router.use('/users', usersRoutes);
router.use('/leasing', leasingRoutes);
router.use('/financial', financialRoutes);
router.use('/operations', operationsRoutes);
router.use('/attom', attomRoutes);
router.use('/agents', agentsRoutes);
router.use('/plaid', plaidRoutes);
router.use('/modern-treasury', modernTreasuryRoutes);
router.use('/mapbox', mapboxRoutes);

export default router;
