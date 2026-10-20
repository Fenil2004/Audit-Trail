import React from 'react';
import { AuditSealMark } from './AuditSealMark';

export const FooterSection: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface-dark)',
        color: 'var(--color-on-dark-soft)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '64px',
        paddingBottom: '48px',
      }}
    >
      <div className="container">
        {/* Top Brand & Status Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            paddingBottom: '40px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '40px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AuditSealMark size={24} color="var(--color-primary)" />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 400,
                letterSpacing: '-0.5px',
                color: 'var(--color-on-dark)',
              }}
            >
              Audit Trail
            </span>
          </div>

          {/* Operational Invariant Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-surface-dark-soft)',
              padding: '6px 14px',
              borderRadius: 'var(--rounded-pill)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '12px',
              color: 'var(--color-on-dark)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
              }}
            />
            <span>All Ledger Invariants Active (Zero Overwrites)</span>
          </div>
        </div>

        {/* 4-Column Directory Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            marginBottom: '48px',
            fontSize: '14px',
          }}
        >
          <div>
            <h4 style={{ color: 'var(--color-on-dark)', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Architecture
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>CQRS Command & Query Segregation</li>
              <li>Append-Only MongoDB Event Store</li>
              <li>Synchronous & Async Read Projections</li>
              <li>Pure Functional Reducer Folding</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-on-dark)', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Cryptographic Proof
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>SHA-256 Block Chaining (prevHash)</li>
              <li>Genesis Vector (64 Zeros)</li>
              <li>Deterministic Canonical JSON</li>
              <li>Tamper-Evident Verification Walk</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-on-dark)', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Forensic Tools
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>Temporal State Scrubbing ("Rewind Time")</li>
              <li>Optimistic Concurrency Control (OCC)</li>
              <li>Cold-Chain IoT Telemetry Graphs</li>
              <li>Immutability Pre-Save Hook Traps</li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'var(--color-on-dark)', fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
              Compliance Standards
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>FDA 21 CFR Part 11 Electronic Records</li>
              <li>Good Distribution Practice (GDP)</li>
              <li>ISO 9001 / ISO 27001 Auditability</li>
              <li>Sub-second Query Performance</li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '12px',
            color: 'var(--color-muted-soft)',
          }}
        >
          <div>
            © {new Date().getFullYear()} Audit Trail. Event-Sourced Logistics Ledger.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cryptographic Spec</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
