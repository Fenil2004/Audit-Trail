import { Router, Request, Response, NextFunction } from 'express';
import { queryService } from './queryService';
import { projectionWorker } from '../projections/projectionWorker';

export const queryRouter = Router();

// GET /api/queries/shipments
queryRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const shipments = await queryService.listShipments({ query, status });
    res.status(200).json({
      success: true,
      count: shipments.length,
      data: shipments,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queries/shipments/:id
queryRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shipment = await queryService.getShipmentById(req.params.id);
    if (!shipment) {
      res.status(404).json({ success: false, message: `Shipment '${req.params.id}' not found.` });
      return;
    }
    res.status(200).json({
      success: true,
      data: shipment,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queries/shipments/:id/events
queryRouter.get('/:id/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await queryService.getEventStream(req.params.id);
    res.status(200).json({
      success: true,
      totalEvents: events.length,
      data: events,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queries/shipments/:id/state-at
// Temporal state scrubbing (time travel query)
queryRouter.get('/:id/state-at', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const version = req.query.version ? parseInt(req.query.version as string, 10) : undefined;
    const timestamp = typeof req.query.timestamp === 'string' ? req.query.timestamp : undefined;

    const result = await queryService.getStateAtTimeOrVersion(req.params.id, { version, timestamp });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queries/shipments/:id/audit-verification
// Cryptographic proof and hash chain integrity verification
queryRouter.get('/:id/audit-verification', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const verification = await queryService.verifyCryptographicAudit(req.params.id);
    res.status(200).json({
      success: true,
      data: verification,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/queries/shipments/:id/telemetry-chart
// Recharts-ready time series telemetry and event flags
queryRouter.get('/:id/telemetry-chart', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chartData = await queryService.getTelemetryChartData(req.params.id);
    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/queries/rebuild-projections
// Reconstructs all read models from scratch by replaying the event store
queryRouter.post('/rebuild-projections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await projectionWorker.rebuildAllProjections();
    res.status(200).json({
      success: true,
      message: 'Projections successfully rebuilt from raw append-only event store.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
