import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { TelemetryPoint } from '../types';

interface TelemetryChartProps {
  data: TelemetryPoint[];
  minTempLimit: number;
  maxTempLimit: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const p = payload[0].payload as TelemetryPoint;
    return (
      <div
        style={{
          backgroundColor: 'var(--color-surface-dark-elevated)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--rounded-md)',
          padding: '12px 16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
          fontSize: '12px',
          color: 'var(--color-on-dark)',
          fontFamily: 'var(--font-code)',
        }}
      >
        <div style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: '6px' }}>
          EVENT v{p.version}: {p.eventType}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>Location: <span style={{ color: '#ffffff' }}>{p.location}</span></div>
          <div>
            Temperature:{' '}
            <strong
              style={{
                color: p.isExcursion ? 'var(--color-error)' : 'var(--color-accent-teal)',
              }}
            >
              {p.temperature !== null ? `${p.temperature}°C` : 'N/A'}
            </strong>
          </div>
          <div>Humidity: <span style={{ color: 'var(--color-accent-amber)' }}>{p.humidity !== null ? `${p.humidity}%` : 'N/A'}</span></div>
          {p.notes && (
            <div style={{ color: 'var(--color-on-dark-soft)', marginTop: '4px', fontStyle: 'italic' }}>
              Note: {p.notes}
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  data,
  minTempLimit,
  maxTempLimit,
}) => {
  const excursionEvents = data.filter((d) => d.isExcursion);

  return (
    <section
      className="section-spacing"
      style={{
        backgroundColor: 'var(--color-surface-dark)',
        color: 'var(--color-on-dark)',
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: 'var(--color-primary)',
                marginBottom: '10px',
              }}
            >
              Forensic Sensor Telemetry
            </div>
            <h2 className="display-lg" style={{ color: 'var(--color-on-dark)', marginBottom: '12px' }}>
              IoT Cold-Chain Telemetry Stream
            </h2>
            <p className="body-md" style={{ color: 'var(--color-on-dark-soft)' }}>
              Continuous temperature and relative humidity recordings mapped against 
              cryptographic event sequence versions.
            </p>
          </div>

          {/* Legend Cluster */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              backgroundColor: 'var(--color-surface-dark-soft)',
              padding: '10px 16px',
              borderRadius: 'var(--rounded-md)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              fontFamily: 'var(--font-body)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--color-accent-teal)', borderRadius: '2px' }} />
              <span>Ambient Temp (°C)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--color-accent-amber)', borderRadius: '2px' }} />
              <span>Humidity (%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '1px', borderTop: '2px dashed #f87171' }} />
              <span>Max Threshold ({maxTempLimit}°C)</span>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};
