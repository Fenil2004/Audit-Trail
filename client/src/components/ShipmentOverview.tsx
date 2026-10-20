import React, { useState } from 'react';
import type { ShipmentReadModel } from '../types';
import {
  ShieldCheck,
  Lock,
  Truck,
  MapPin,
  Copy,
  Check,
} from 'lucide-react';

interface ShipmentOverviewProps {
  shipment: ShipmentReadModel;
  onOpenAuditModal: () => void;
  onSimulateTamper: () => void;
  isTamperTesting?: boolean;
}

export const ShipmentOverview: React.FC<ShipmentOverviewProps> = ({
  shipment,
  onOpenAuditModal,
  onSimulateTamper,
  isTamperTesting = false,
}) => {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(shipment.lastEventHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (shipment.status) {
      case 'EXCURSION_ALERT':
        return {
          label: 'EXCURSION ALERT',
          bg: 'rgba(198, 69, 69, 0.12)',
          color: 'var(--color-error)',
          border: 'rgba(198, 69, 69, 0.3)',
        };
      case 'CUSTOMS_HOLD':
        return {
          label: 'CUSTOMS HOLD',
          bg: 'rgba(212, 160, 23, 0.12)',
          color: 'var(--color-warning)',
          border: 'rgba(212, 160, 23, 0.3)',
        };
      case 'DELIVERED':
        return {
          label: 'DELIVERED',
          bg: 'rgba(93, 184, 114, 0.12)',
          color: 'var(--color-success)',
          border: 'rgba(93, 184, 114, 0.3)',
        };
      default:
        return {
          label: 'IN TRANSIT',
          bg: 'rgba(93, 184, 166, 0.12)',
          color: 'var(--color-accent-teal)',
          border: 'rgba(93, 184, 166, 0.3)',
        };
    }
  };

  const statusStyle = getStatusBadge();

  return (
    <section
      className="section-spacing"
      style={{
        backgroundColor: 'var(--color-canvas)',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Category Pill */}
        <div style={{ marginBottom: '24px' }}>
          <span className="badge-pill">
            <Lock size={13} color="var(--color-primary)" />
            IMMUTABLE EVENT LOG // SHA-256 HASH CHAIN
          </span>
        </div>

        {/* 6-6 Grid Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Editorial Headline & Actions */}
          <div style={{ maxWidth: '580px' }}>
            <h1 className="display-xl" style={{ marginBottom: '24px' }}>
              Proof of sequence. Zero overwrites.
            </h1>

            <p
              className="body-md"
              style={{
                fontSize: '18px',
                lineHeight: 1.6,
                color: 'var(--color-body-strong)',
                marginBottom: '36px',
              }}
            >
              Traditional CRUD databases destroy historical truth with every database 
              mutation. Audit Trail records every inventory adjustment, customs 
              inspection, and cold-chain temperature excursion as an indelible 
              event sealed by cryptographic SHA-256 hash chains.
            </p>

            {/* Button Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '40px',
              }}
            >
              <button
                onClick={onOpenAuditModal}
                className="button-primary"
                style={{ padding: '0 24px', height: '44px' }}
              >
                <ShieldCheck size={16} /> Verify Cryptographic Audit
              </button>

              <button
                onClick={onSimulateTamper}
                disabled={isTamperTesting}
                className="button-secondary"
                style={{ padding: '0 24px', height: '44px' }}
              >
                {isTamperTesting ? 'Testing Driver Defense...' : 'Simulate Tamper Attack'}
              </button>
            </div>

            {/* Invariant Highlights */}
            <div
              style={{
                borderTop: '1px solid var(--color-hairline)',
                paddingTop: '20px',
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Aggregate ID
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: '15px', color: 'var(--color-ink)', fontWeight: 500 }}>
                  {shipment.aggregateId}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Current Version
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: '15px', color: 'var(--color-primary)', fontWeight: 600 }}>
                  v{shipment.version}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Chain Integrity
                </div>
                <div style={{ fontSize: '15px', color: 'var(--color-success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={16} /> 100% Verified
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dark Navy Product Mockup Surface */}
          <div>
            <div
              className="product-mockup-card-dark"
              style={{
                borderRadius: 'var(--rounded-xl)',
                backgroundColor: 'var(--color-surface-dark)',
                color: 'var(--color-on-dark)',
              }}
            >
              {/* Card Header Chrome */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      fontFamily: 'var(--font-code)',
                      color: 'var(--color-on-dark-soft)',
                    }}
                  >
                    CONTAINER: {shipment.containerNumber}
                  </span>
                </div>

                {/* Status Badge */}
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--rounded-pill)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                  }}
                >
                  {statusStyle.label}
                </div>
              </div>

              {/* Cargo Description */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-on-dark-soft)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginBottom: '4px',
                  }}
                >
                  Manifest Description
                </div>
                <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-on-dark)' }}>
                  {shipment.cargoDescription}
                </div>
              </div>

              {/* Grid of Key Metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  backgroundColor: 'var(--color-surface-dark-soft)',
                  borderRadius: 'var(--rounded-md)',
                  padding: '16px',
                  marginBottom: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-dark-soft)', textTransform: 'uppercase' }}>
                    Current Location
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-on-dark)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="var(--color-primary)" />
                    <span>{shipment.currentLocation}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-dark-soft)', textTransform: 'uppercase' }}>
                    Current Custodian
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-on-dark)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Truck size={14} color="var(--color-accent-teal)" />
                    <span>{shipment.currentCustodian}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-dark-soft)', textTransform: 'uppercase' }}>
                    Ambient Temperature
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-code)',
                      color:
                        shipment.currentTemperature &&
                        (shipment.currentTemperature > shipment.maxTempLimit ||
                          shipment.currentTemperature < shipment.minTempLimit)
                          ? 'var(--color-error)'
                          : 'var(--color-accent-teal)',
                      marginTop: '2px',
                    }}
                  >
                    {typeof shipment.currentTemperature === 'number'
                      ? `${shipment.currentTemperature.toFixed(1)}°C`
                      : 'Pending Ingestion'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-on-dark-soft)', textTransform: 'uppercase' }}>
                    Safe Threshold Limits
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: 'var(--font-code)', color: 'var(--color-on-dark-soft)', marginTop: '2px' }}>
                    {shipment.minTempLimit}°C to {shipment.maxTempLimit}°C
                  </div>
                </div>
              </div>

              {/* Cryptographic Event Seal Strip */}
              <div
                style={{
                  backgroundColor: '#11100f',
                  borderRadius: 'var(--rounded-md)',
                  padding: '12px 14px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  fontSize: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-code)', fontWeight: 500 }}>
                    LATEST EVENT HASH (SHA-256)
                  </span>
                  <button
                    onClick={copyHash}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-on-dark-soft)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {copied ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    color: '#c2beb4',
                    wordBreak: 'break-all',
                  }}
                >
                  {shipment.lastEventHash}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
