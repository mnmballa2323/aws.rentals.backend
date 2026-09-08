import { Request, Response } from 'express';
import { mapboxService } from '../services/mapbox.service';
import { sendSuccess, sendError } from '../utils/response';

export class MapboxController {
  async forwardGeocode(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query['q'] as string) || '';
      if (!query.trim()) {
        sendError(res, 400, 'BAD_REQUEST', 'Query parameter "q" is required');
        return;
      }
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 5;
      const results = await mapboxService.forwardGeocode(query, { limit });
      sendSuccess(res, results);
    } catch (err) {
      sendError(res, 500, 'INTERNAL_SERVER_ERROR', (err as Error).message);
    }
  }

  async reverseGeocode(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query['lat'] as string);
      const lon = parseFloat(req.query['lon'] as string);
      if (isNaN(lat) || isNaN(lon)) {
        sendError(res, 400, 'BAD_REQUEST', 'Valid "lat" and "lon" query parameters are required');
        return;
      }
      const result = await mapboxService.reverseGeocode(lon, lat);
      sendSuccess(res, result);
    } catch (err) {
      sendError(res, 500, 'INTERNAL_SERVER_ERROR', (err as Error).message);
    }
  }

  async getIsochrone(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query['lat'] as string);
      const lon = parseFloat(req.query['lon'] as string);
      if (isNaN(lat) || isNaN(lon)) {
        sendError(res, 400, 'BAD_REQUEST', 'Valid "lat" and "lon" query parameters are required');
        return;
      }
      const minutesParam = (req.query['minutes'] as string) || '15,30,45';
      const minutes = minutesParam.split(',').map((m) => parseInt(m.trim(), 10)).filter((m) => !isNaN(m));
      const profile = ((req.query['profile'] as string) || 'driving') as 'driving' | 'walking' | 'cycling';

      const isochrones = await mapboxService.getIsochrone(lon, lat, minutes, profile);
      sendSuccess(res, isochrones);
    } catch (err) {
      sendError(res, 500, 'INTERNAL_SERVER_ERROR', (err as Error).message);
    }
  }

  async getDistanceMatrix(req: Request, res: Response): Promise<void> {
    try {
      const { coordinates, profile } = req.body;
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        sendError(res, 400, 'BAD_REQUEST', 'Array of at least 2 coordinate pairs [longitude, latitude] required');
        return;
      }
      const matrix = await mapboxService.getDistanceMatrix(coordinates, profile || 'driving');
      sendSuccess(res, matrix);
    } catch (err) {
      sendError(res, 500, 'INTERNAL_SERVER_ERROR', (err as Error).message);
    }
  }

  async getStaticMapUrl(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query['lat'] as string);
      const lon = parseFloat(req.query['lon'] as string);
      if (isNaN(lat) || isNaN(lon)) {
        sendError(res, 400, 'BAD_REQUEST', 'Valid "lat" and "lon" query parameters are required');
        return;
      }
      const zoom = req.query['zoom'] ? parseInt(req.query['zoom'] as string, 10) : 14;
      const width = req.query['width'] ? parseInt(req.query['width'] as string, 10) : 600;
      const height = req.query['height'] ? parseInt(req.query['height'] as string, 10) : 360;
      const pinColor = (req.query['pinColor'] as string) || '2563eb';
      const style = (req.query['style'] as string) || 'streets-v12';

      const url = mapboxService.generateStaticMapUrl(lon, lat, { zoom, width, height, pinColor, style });
      sendSuccess(res, { url });
    } catch (err) {
      sendError(res, 500, 'INTERNAL_SERVER_ERROR', (err as Error).message);
    }
  }
}

export const mapboxController = new MapboxController();
