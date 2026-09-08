import { Router } from 'express';
import { mapboxController } from '../controllers/mapbox.controller';

const router = Router();

// Geocoding: Forward & Reverse
router.get('/geocode', (req, res) => mapboxController.forwardGeocode(req, res));
router.get('/reverse', (req, res) => mapboxController.reverseGeocode(req, res));

// Isochrone Commute Polygons
router.get('/isochrone', (req, res) => mapboxController.getIsochrone(req, res));

// Directions & Distance Matrix
router.post('/matrix', (req, res) => mapboxController.getDistanceMatrix(req, res));

// Static Map Image Generator
router.get('/static-url', (req, res) => mapboxController.getStaticMapUrl(req, res));

export default router;
