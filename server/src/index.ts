import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ZodError } from 'zod';
import { connectDatabase } from './config/db';
import { seedDatabase } from './seeds/seedData';
import { commandRouter } from './commands/commandRoutes';
import { queryRouter } from './queries/queryRoutes';
import { authRouter } from './auth/authRoutes';
import { eventStoreRepository } from './eventStore/eventStoreRepository';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Request Logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Favicon handler
app.get('/favicon.ico', (_req: Request, res: Response) => res.status(204).end());

// Health & System Statistics Endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const totalEvents = await eventStoreRepository.countTotalEvents();
  const aggregateIds = await eventStoreRepository.getAllAggregateIds();

  res.status(200).json({
    status: 'HEALTHY',
    system: 'Audit Trail Event-Sourced Logistics Ledger',
    architecture: 'CQRS & Event Sourcing (Node.js + MongoDB)',
    timestamp: new Date().toISOString(),
    eventStore: {
      collection: 'events',
      immutabilityGuardsActive: true,
      totalEvents,
      activeAggregatesCount: aggregateIds.length,
    },
  });
});

// CQRS Route Mounts
// 1. Write Side (Commands): Handles state mutations by creating immutable events
app.use('/api/commands/shipments', commandRouter);

// 2. Read Side (Queries): Handles low-latency projection queries and temporal scrubbing
app.use('/api/queries/shipments', queryRouter);

// 3. Security & Identity (Bonus): Authenticated JWT Operator Personas & Tokens
app.use('/api/auth', authRouter);

// Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.name || 'Error'}: ${err.message}`);

  // 1. Zod Schema Validation Error (400)
  if (err instanceof ZodError) {
    const errorDetails = err.errors.map(e => `${e.path.join('.') || 'field'}: ${e.message}`).join('; ');
    console.error(`[VALIDATION ERROR DETAILS]: ${errorDetails}`);
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: `Validation failed: ${errorDetails}`,
      errors: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // 2. Optimistic Concurrency Control Violation (409)
  if (err.code === 'CONCURRENCY_VIOLATION' || err.name === 'ConcurrencyConflictError') {
    res.status(409).json({
      success: false,
      code: 'CONCURRENCY_VIOLATION',
      message: err.message,
      expectedVersion: err.expectedVersion,
      currentVersion: err.currentVersion,
    });
    return;
  }

  // 3. Immutability Violation (403)
  if (err.code === 'IMMUTABILITY_VIOLATION' || err.name === 'ImmutabilityViolationError') {
    res.status(403).json({
      success: false,
      code: 'IMMUTABILITY_VIOLATION',
      message: err.message,
    });
    return;
  }

  // 4. Domain Invariant Violation (422)
  if (err.code === 'INVARIANT_VIOLATION' || err.name === 'DomainInvariantViolationError') {
    res.status(422).json({
      success: false,
      code: 'INVARIANT_VIOLATION',
      message: err.message,
    });
    return;
  }

  // Default Internal Server Error (500)
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.',
  });
});

// Boot Server
async function startServer() {
  try {
    await connectDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Audit Trail Ledger Backend listening on port ${PORT}`);
      console.log(`📡 CQRS Commands: http://localhost:${PORT}/api/commands/shipments`);
      console.log(`🔍 CQRS Queries:  http://localhost:${PORT}/api/queries/shipments`);
      console.log(`🛡️  Immutability Guard: ACTIVE (Strict Append-Only)`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to start backend server:', err);
    process.exit(1);
  }
}

startServer();
