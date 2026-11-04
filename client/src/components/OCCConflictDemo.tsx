import React, { useState } from 'react';
import { GitPullRequestClosed, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { ShipmentReadModel } from '../types';

interface OCCConflictDemoProps {
  shipment: ShipmentReadModel;
  onRefresh: () => void;
}

export const OCCConflictDemo: React.FC<OCCConflictDemoProps> = ({ shipment, onRefresh }) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [conflictResponse, setConflictResponse] = useState<any | null>(null);

  const simulateConflict = async () => {
    setIsSimulating(true);
    setConflictResponse(null);

    // Stale version simulation: expectedVersion is currentVersion - 1
    const staleVersion = Math.max(0, shipment.version - 1);

    try {
      await api.recordTelemetry({
        aggregateId: shipment.aggregateId,
        expectedVersion: staleVersion, // STALE!
        location: 'Simulated Concurrent Collision Test',
        temperature: shipment.currentTemperature || 5,
        humidity: 50,
        shockDetected: false,
        actor: 'Concurrent Operator (Collision Simulator)',
        role: 'TEST_AGENT',
      });
      // Should NOT reach here
      setConflictResponse({
        success: true,
        message: 'Unexpected: Command succeeded without OCC check!',
      });
    } catch (err: any) {
      // Caught the 409 CONCURRENCY_VIOLATION
      setConflictResponse({
        success: false,
        status: 409,
        code: err.code || 'CONCURRENCY_VIOLATION',
        message: err.message,
        expectedVersion: err.expectedVersion ?? staleVersion,
        currentVersion: err.currentVersion ?? shipment.version,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <section
      className="section-spacing"
      style={{
        backgroundColor: 'var(--color-canvas)',
        borderTop: '1px solid var(--color-hairline)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '640px', marginBottom: '32px' }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--color-muted)',
              marginBottom: '10px',
            }}
          >
            Concurrency Protection
          </div>
          <h2 className="display-lg" style={{ marginBottom: '14px' }}>
            Optimistic Concurrency Control (OCC)
          </h2>
          <p className="body-md" style={{ color: 'var(--color-body-strong)' }}>
            When multiple logistics dispatchers or automated IoT gateways record events 
            simultaneously, the event store validates that the client's `expectedVersion` matches 
            the database sequence before appending. Stale commands are rejected with HTTP 409 Conflict.
          </p>
        </div>
      </div>
    </section>
  );
};
