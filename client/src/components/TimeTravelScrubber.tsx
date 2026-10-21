import React, { useState, useEffect } from 'react';
import { History, Play, Pause, SkipBack, Clock, RotateCcw } from 'lucide-react';
import type { StoredEvent, ReconstructedState } from '../types';
import { api } from '../services/api';

interface TimeTravelScrubberProps {
  aggregateId: string;
  totalVersions: number;
  events: StoredEvent[];
  onHistoricalStateChange: (state: ReconstructedState | null) => void;
}

export const TimeTravelScrubber: React.FC<TimeTravelScrubberProps> = ({
  aggregateId,
  totalVersions,
  events,
  onHistoricalStateChange,
}) => {
  const [currentScrubVersion, setCurrentScrubVersion] = useState<number>(totalVersions);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [reconstructedState, setReconstructedState] = useState<ReconstructedState | null>(null);

  // Fetch reconstructed state when scrub version changes backwards
  useEffect(() => {
    if (currentScrubVersion >= totalVersions) {
      return;
    }

    let isMounted = true;
    api
      .getStateAt(aggregateId, currentScrubVersion)
      .then((res) => {
        if (isMounted) {
          setReconstructedState(res.state);
          onHistoricalStateChange(res.state);
        }
      })
      .catch((err) => {
        console.error('Time travel scrubbing error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentScrubVersion, totalVersions, aggregateId, onHistoricalStateChange]);

  // Auto-play interval
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentScrubVersion((prev) => {
          if (prev >= totalVersions) {
            setIsPlaying(false);
            setReconstructedState(null);
            onHistoricalStateChange(null);
            return totalVersions;
          }
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, totalVersions, onHistoricalStateChange]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      if (currentScrubVersion >= totalVersions) {
        setCurrentScrubVersion(1);
      }
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const activeScrubEvent = events.find((e) => e.version === currentScrubVersion);
  const isRewound = currentScrubVersion < totalVersions;

  return (
    <section
      className="section-spacing"
      style={{
        backgroundColor: 'var(--color-surface-soft)',
        borderTop: '1px solid var(--color-hairline)',
        borderBottom: '1px solid var(--color-hairline)',
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
            Temporal State Scrubbing
          </div>
          <h2 className="display-lg" style={{ marginBottom: '14px' }}>
            Rewind time. Inspect any historical second.
          </h2>
          <p className="body-md" style={{ color: 'var(--color-body-strong)' }}>
            Because state is pure event folding (State = Fold(Genesis ... vN)), 
            we can mathematically reconstruct the container's exact location, 
            temperature, and custodian at any version from Genesis.
          </p>
        </div>

        {/* Scrubber Control Card */}
        <div
          className="feature-card"
          style={{
            backgroundColor: 'var(--color-surface-card)',
            padding: 'var(--spacing-xl)',
            marginBottom: '32px',
          }}
        >
          {/* Top Controls Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleTogglePlay}
                className="button-primary"
                style={{ height: '36px', padding: '0 14px', fontSize: '13px' }}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause Playback' : 'Replay Timeline'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentScrubVersion(1);
                }}
                className="button-secondary"
                style={{ height: '36px', padding: '0 12px', fontSize: '13px' }}
                title="Rewind to Genesis"
              >
                <SkipBack size={14} /> Genesis (v1)
              </button>

              {isRewound && (
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentScrubVersion(totalVersions);
                    setReconstructedState(null);
                    onHistoricalStateChange(null);
                  }}
                  className="button-secondary"
                  style={{
                    height: '36px',
                    padding: '0 12px',
                    fontSize: '13px',
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                  }}
                >
                  <RotateCcw size={14} /> Jump to Live (v{totalVersions})
                </button>
              )}
            </div>

            {/* Version Display Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '13px',
                  color: 'var(--color-muted)',
                }}
              >
                Target State:
              </span>
              <span
                className="badge-coral"
                style={{
                  backgroundColor: isRewound ? 'var(--color-primary)' : 'var(--color-ink)',
                }}
              >
                {isRewound ? `REWOUND // v${currentScrubVersion}` : `LIVE // v${totalVersions}`}
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div style={{ position: 'relative', margin: '20px 0 10px 0' }}>
            <input
              type="range"
              min={1}
              max={Math.max(totalVersions, 1)}
              value={currentScrubVersion}
              onChange={(e) => {
                setIsPlaying(false);
                const val = parseInt(e.target.value, 10);
                setCurrentScrubVersion(val);
                if (val >= totalVersions) {
                  setReconstructedState(null);
                  onHistoricalStateChange(null);
                }
              }}
              style={{
                width: '100%',
                height: '8px',
                borderRadius: 'var(--rounded-pill)',
                appearance: 'none',
                background: 'var(--color-surface-cream-strong)',
                outline: 'none',
                cursor: 'pointer',
                accentColor: 'var(--color-primary)',
              }}
            />

            {/* Version Ticks */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-code)',
                color: 'var(--color-muted)',
              }}
            >
              <span>v1 (Genesis)</span>
              <span>v{Math.floor(totalVersions / 2)}</span>
              <span>v{totalVersions} (Live)</span>
            </div>
          </div>

          {/* Active Version Snapshot Strip */}
          {activeScrubEvent && (
            <div
              style={{
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--rounded-md)',
                padding: '14px 18px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} color="var(--color-primary)" />
                <span>
                  Event at <strong>v{activeScrubEvent.version}</strong>:
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-code)',
                    color: 'var(--color-ink)',
                    fontWeight: 600,
                  }}
                >
                  {activeScrubEvent.eventType}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', color: 'var(--color-muted)' }}>
                <span>Actor: {activeScrubEvent.metadata?.actor}</span>
                <span>Time: {new Date(activeScrubEvent.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Reconstructed Historic State Preview (Visible when rewound) */}
        {isRewound && reconstructedState && (
          <div
            className="product-mockup-card-dark"
            style={{
              backgroundColor: 'var(--color-surface-dark)',
              borderRadius: 'var(--rounded-lg)',
              padding: 'var(--spacing-xl)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                  HISTORICAL RECONSTRUCTED STATE AT VERSION {reconstructedState.version}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-on-dark-soft)', fontFamily: 'var(--font-code)' }}>
                Mathematical Fold: 100% Deterministic
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                fontSize: '13px',
              }}
            >
              <div>
                <div style={{ color: 'var(--color-on-dark-soft)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Historic Status
                </div>
                <div style={{ color: 'var(--color-on-dark)', fontWeight: 600, marginTop: '2px' }}>
                  {reconstructedState.status}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-on-dark-soft)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Location at v{reconstructedState.version}
                </div>
                <div style={{ color: 'var(--color-on-dark)', fontWeight: 500, marginTop: '2px' }}>
                  {reconstructedState.currentLocation}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-on-dark-soft)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Ambient Temperature
                </div>
                <div style={{ fontFamily: 'var(--font-code)', color: 'var(--color-accent-teal)', fontWeight: 600, marginTop: '2px' }}>
                  {typeof reconstructedState.currentTemperature === 'number'
                    ? `${reconstructedState.currentTemperature.toFixed(1)}°C`
                    : 'Pending Ingestion'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-on-dark-soft)', fontSize: '11px', textTransform: 'uppercase' }}>
                  Custodian at v{reconstructedState.version}
                </div>
                <div style={{ color: 'var(--color-on-dark)', fontWeight: 500, marginTop: '2px' }}>
                  {reconstructedState.currentCustodian}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
