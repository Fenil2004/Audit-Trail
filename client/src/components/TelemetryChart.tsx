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

export const TelemetryChart: React.FC<TelemetryChartProps> = () => {}
