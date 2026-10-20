import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ShipmentOverview } from './components/ShipmentOverview';
import { TimeTravelScrubber } from './components/TimeTravelScrubber';
import { TelemetryChart } from './components/TelemetryChart';
import { OCCConflictDemo } from './components/OCCConflictDemo';
import { ChronologicalTimeline } from './components/ChronologicalTimeline';
import { CalloutCardCoral } from './components/CalloutCardCoral';
import { CryptographicAuditModal } from './components/CryptographicAuditModal';
import { CommandDispatchModal } from './components/CommandDispatchModal';
import { FooterSection } from './components/FooterSection';
import { ErrorBoundary } from './components/ErrorBoundary';
import { api } from './services/api';
import type { ShipmentReadModel, StoredEvent, TelemetryPoint, ReconstructedState, OperatorPersona } from './types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('SHIP-PHARMA-9021');
  const [shipments, setShipments] = useState<ShipmentReadModel[]>([]);
  const [currentShipment, setCurrentShipment] = useState<ShipmentReadModel | null>(null);
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [chartData, setChartData] = useState<TelemetryPoint[]>([]);
  const [historicalState, setHistoricalState] = useState<ReconstructedState | null>(null);

  // JWT Personas (Bonus Goal)
  const [personas, setPersonas] = useState<OperatorPersona[]>([]);
  const [activePersona, setActivePersona] = useState<OperatorPersona | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isTamperTesting, setIsTamperTesting] = useState(false);
  const [tamperBanner, setTamperBanner] = useState<{ blocked: boolean; message: string } | null>(null);

  // Load JWT personas once on mount
  useEffect(() => {
    api.getPersonas()
      .then((data) => {
        setPersonas(data);
        if (data.length > 0) {
          setActivePersona(data[0]);
          api.setAuthToken(data[0].token);
        }
      })
      .catch((err) => console.warn('Could not load personas:', err));
  }, []);

  const handleSelectPersona = (p: OperatorPersona) => {
    setActivePersona(p);
    api.setAuthToken(p.token);
  };

  const [refreshIndex, setRefreshIndex] = useState(0);

  // Initial and reactive load
  useEffect(() => {
    let isCancelled = false;
    const fetchData = async () => {
      try {
        const [allShipments, activeShipment, eventsList, telemetryPoints] = await Promise.all([
          api.getShipments(),
          api.getShipment(selectedId),
          api.getEvents(selectedId),
          api.getTelemetryChart(selectedId),
        ]);
        if (!isCancelled) {
          setShipments(allShipments);
          setCurrentShipment(activeShipment);
          setEvents(eventsList);
          setChartData(telemetryPoints);
          setHistoricalState(null);
          setError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Error loading ledger data:', err);
          setError(err.message || 'Failed to load ledger data from backend API');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [selectedId, refreshIndex]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshIndex((prev) => prev + 1);
  };

  const handleSimulateTamper = async () => {
    setIsTamperTesting(true);
    setTamperBanner(null);
    try {
      const res = await api.simulateTamperAttack(selectedId);
      setTamperBanner({
        blocked: res.blocked,
        message: res.caughtErrorMessage || 'Mutation successfully blocked by Mongoose pre-save hooks.',
      });
      setTimeout(() => setTamperBanner(null), 7000);
    } catch (err: any) {
      setTamperBanner({
        blocked: true,
        message: err.message || 'IMMUTABILITY AUDIT VIOLATION: Operation intercepted and blocked.',
      });
      setTimeout(() => setTamperBanner(null), 7000);
    } finally {
      setIsTamperTesting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation with Search & Persona Switcher */}
      <Navbar
        shipments={shipments}
        selectedId={selectedId}
        onSelectShipment={(id) => setSelectedId(id)}
        onOpenCommandModal={() => setIsCommandModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        personas={personas}
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
      />

      {/* Global Tamper Trapped Banner Alert */}
      {tamperBanner && (
        <div
          style={{
            backgroundColor: tamperBanner.blocked ? 'var(--color-surface-dark)' : 'var(--color-error)',
            color: 'var(--color-on-dark)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
          }}
        >
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ color: 'var(--color-primary)' }}>IMMUTABILITY DEFENSE HOOK ACTIVE:</strong>{' '}
              <span>{tamperBanner.message}</span>
            </div>
            <button
              onClick={() => setTamperBanner(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-on-dark-soft)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flexGrow: 1 }}>
        {loading ? (
          <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--color-muted)' }}>
            <RefreshCw size={32} className="spin" style={{ margin: '0 auto 16px auto', color: 'var(--color-primary)' }} />
            <h3 className="title-md" style={{ color: 'var(--color-ink)' }}>Connecting to Event Store Ledger...</h3>
            <p className="body-sm" style={{ marginTop: '8px' }}>Validating SHA-256 genesis blocks and compiling read models.</p>
          </div>
        ) : error ? (
          <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
            <AlertCircle size={40} color="var(--color-error)" style={{ margin: '0 auto 16px auto' }} />
            <h2 className="title-lg" style={{ color: 'var(--color-error)', marginBottom: '8px' }}>
              Connection Error
            </h2>
            <p className="body-md" style={{ color: 'var(--color-body)', marginBottom: '24px' }}>
              {error}
            </p>
            <button onClick={handleRefresh} className="button-primary">
              Retry Connection
            </button>
          </div>
        ) : currentShipment ? (
          <>
            {/* 1. Hero Overview Band (Cream canvas + Dark navy product card) */}
            <ErrorBoundary fallbackTitle="Hero Overview Component">
              <ShipmentOverview
                shipment={currentShipment}
                onOpenAuditModal={() => setIsAuditModalOpen(true)}
                onSimulateTamper={handleSimulateTamper}
                isTamperTesting={isTamperTesting}
              />
            </ErrorBoundary>

            {/* 2. Temporal State Scrubbing ("Rewind Time") on Soft Cream Band */}
            <ErrorBoundary fallbackTitle="Time Travel Scrubber Component">
              <TimeTravelScrubber
                key={currentShipment.aggregateId}
                aggregateId={currentShipment.aggregateId}
                totalVersions={currentShipment.version}
                events={events}
                onHistoricalStateChange={(state) => {
                  setHistoricalState(state);
                }}
              />
            </ErrorBoundary>

            {/* 3. Sensor Telemetry Stream (Dark Navy Product Surface) */}
            <ErrorBoundary fallbackTitle="Telemetry Chart Component">
              <TelemetryChart
                data={chartData}
                minTempLimit={currentShipment.minTempLimit}
                maxTempLimit={currentShipment.maxTempLimit}
              />
            </ErrorBoundary>

            {/* 4. Optimistic Concurrency Control (OCC) Collision Demo Card */}
            <ErrorBoundary fallbackTitle="OCC Conflict Demo Component">
              <OCCConflictDemo
                shipment={currentShipment}
                onRefresh={handleRefresh}
              />
            </ErrorBoundary>

            {/* 5. Chronological Append-Only Event Timeline */}
            <ErrorBoundary fallbackTitle="Event Timeline Component">
              <ChronologicalTimeline
                events={events}
                activeHistoricalVersion={historicalState ? historicalState.version : undefined}
              />
            </ErrorBoundary>

            {/* 6. Full-Bleed Coral Callout Card */}
            <ErrorBoundary fallbackTitle="Compliance Callout Component">
              <CalloutCardCoral
                aggregateId={currentShipment.aggregateId}
                onOpenAudit={() => setIsAuditModalOpen(true)}
              />
            </ErrorBoundary>
          </>
        ) : null}
      </main>

      {/* Footer (Dark Navy Surface) */}
      <FooterSection />

      {/* Modals */}
      {currentShipment && (
        <>
          <CryptographicAuditModal
            aggregateId={currentShipment.aggregateId}
            isOpen={isAuditModalOpen}
            onClose={() => setIsAuditModalOpen(false)}
          />

          {isCommandModalOpen && (
            <CommandDispatchModal
              key={`${currentShipment.aggregateId}-${currentShipment.version}`}
              shipment={currentShipment}
              isOpen={isCommandModalOpen}
              onClose={() => setIsCommandModalOpen(false)}
              onCommandSuccess={handleRefresh}
              onShipmentCreated={(newId) => {
                setSelectedId(newId);
                handleRefresh();
              }}
              activePersona={activePersona}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
