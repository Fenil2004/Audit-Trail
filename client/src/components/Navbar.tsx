import React, { useState, useRef, useEffect } from 'react';
import { AuditSealMark } from './AuditSealMark';
import { Plus, RefreshCw, Search, X, Shield, ChevronDown, Check } from 'lucide-react';
import type { ShipmentReadModel, OperatorPersona } from '../types';

interface NavbarProps {
  shipments: ShipmentReadModel[];
  selectedId: string;
  onSelectShipment: (id: string) => void;
  onOpenCommandModal: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  personas?: OperatorPersona[];
  activePersona?: OperatorPersona | null;
  onSelectPersona?: (persona: OperatorPersona) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  shipments,
  selectedId,
  onSelectShipment,
  onOpenCommandModal,
  onRefresh,
  isRefreshing = false,
  personas = [],
  activePersona = null,
  onSelectPersona,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const personaRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (personaRef.current && !personaRef.current.contains(e.target as Node)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredShipments = shipments.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.aggregateId.toLowerCase().includes(q) ||
      s.containerNumber.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      s.cargoDescription.toLowerCase().includes(q)
    );
  });

  const handleSelect = (id: string) => {
    onSelectShipment(id);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (filteredShipments.length > 0) {
        handleSelect(filteredShipments[0].aggregateId);
      } else if (searchQuery.trim()) {
        handleSelect(searchQuery.trim().toUpperCase());
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '64px',
        backgroundColor: 'var(--color-canvas)',
        borderBottom: '1px solid var(--color-hairline)',
        transition: 'background-color 0.2s ease',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          gap: '16px',
        }}
      >
        {/* Brand Left: Seal Mark + Editorial Display Serif */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AuditSealMark size={22} color="var(--color-primary)" />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px',
                fontWeight: 400,
                letterSpacing: '-0.5px',
                color: 'var(--color-ink)',
              }}
            >
              Audit Trail
            </span>
          </div>

          {/* Preset Aggregate Pills */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '6px',
            }}
            className="desktop-pills"
          >
            {shipments.slice(0, 3).map((s) => {
              const isSelected = s.aggregateId === selectedId;
              return (
                <button
                  key={s.aggregateId}
                  onClick={() => onSelectShipment(s.aggregateId)}
                  className={isSelected ? 'category-tab category-tab-active' : 'category-tab'}
                  style={{
                    border: '1px solid ' + (isSelected ? 'var(--color-hairline)' : 'transparent'),
                    fontSize: '11px',
                    padding: '4px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title={s.cargoDescription}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor:
                        s.status === 'EXCURSION_ALERT'
                          ? 'var(--color-error)'
                          : s.status === 'CUSTOMS_HOLD'
                          ? 'var(--color-warning)'
                          : 'var(--color-success)',
                    }}
                  />
                  <span>{s.aggregateId}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Search Bar Component (Week 1 & Forensic Dashboard Spec) */}
        <div ref={searchRef} style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-soft)',
              border: '1px solid var(--color-hairline)',
              borderRadius: 'var(--rounded-md)',
              padding: '0 10px',
              height: '36px',
              transition: 'border-color 0.2s',
            }}
          >
            <Search size={14} color="var(--color-muted)" style={{ flexShrink: 0, marginRight: '8px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search shipment ID (e.g. SHIP-PHARMA)..."
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                fontSize: '12px',
                color: 'var(--color-ink)',
                width: '100%',
                fontFamily: 'var(--font-body)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--color-muted)' }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-canvas)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--rounded-md)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                maxHeight: '280px',
                overflowY: 'auto',
                zIndex: 200,
                padding: '6px',
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--color-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {filteredShipments.length > 0 ? 'Select Shipment Container' : 'Press Enter to search custom ID'}
              </div>

              {filteredShipments.map((s) => (
                <div
                  key={s.aggregateId}
                  onClick={() => handleSelect(s.aggregateId)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: s.aggregateId === selectedId ? 'var(--color-surface-soft)' : 'transparent',
                    fontSize: '12px',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = s.aggregateId === selectedId ? 'var(--color-surface-soft)' : 'transparent')
                  }
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="code-font">{s.aggregateId}</span>
                      <span className="badge-pill" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        v{s.version}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>
                      {s.containerNumber} • {s.origin.split(' ')[0]} → {s.destination.split(' ')[0]}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      backgroundColor:
                        s.status === 'EXCURSION_ALERT'
                          ? 'rgba(198, 69, 69, 0.12)'
                          : s.status === 'CUSTOMS_HOLD'
                          ? 'rgba(212, 160, 23, 0.12)'
                          : 'rgba(93, 184, 114, 0.12)',
                      color:
                        s.status === 'EXCURSION_ALERT'
                          ? 'var(--color-error)'
                          : s.status === 'CUSTOMS_HOLD'
                          ? 'var(--color-warning)'
                          : 'var(--color-success)',
                    }}
                  >
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
              ))}

              {searchQuery && !filteredShipments.some((s) => s.aggregateId.toLowerCase() === searchQuery.toLowerCase().trim()) && (
                <div
                  onClick={() => handleSelect(searchQuery.trim().toUpperCase())}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    borderTop: '1px dashed var(--color-hairline)',
                    marginTop: '4px',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Search size={12} />
                  <span>Lookup custom ID: <strong className="code-font">{searchQuery.toUpperCase()}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Persona Selector + Refresh + Dispatch CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* JWT Operator Persona Dropdown (Bonus Stretch Goal) */}
          {personas.length > 0 && (
            <div ref={personaRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-hairline)',
                  borderRadius: 'var(--rounded-md)',
                  padding: '5px 10px',
                  fontSize: '11px',
                  color: 'var(--color-ink)',
                  cursor: 'pointer',
                  height: '34px',
                }}
                title="Active JWT Authenticated Operator"
              >
                <Shield size={13} color="var(--color-primary)" />
                <span style={{ fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activePersona ? activePersona.name.split(' ')[0] : 'Operator'}
                </span>
                <ChevronDown size={11} color="var(--color-muted)" />
              </button>

              {isPersonaMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '240px',
                    backgroundColor: 'var(--color-canvas)',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--rounded-md)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                    zIndex: 200,
                    padding: '8px',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--color-muted)', padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Authenticated JWT Operator
                  </div>

                  {personas.map((p) => {
                    const isSelected = activePersona?.id === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (onSelectPersona) onSelectPersona(p);
                          setIsPersonaMenuOpen(false);
                        }}
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--color-surface-soft)' : 'transparent',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          gap: '6px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{p.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-primary)' }}>{p.role}</div>
                          <div style={{ fontSize: '9px', color: 'var(--color-muted)' }}>{p.organization}</div>
                        </div>
                        {isSelected && <Check size={14} color="var(--color-success)" style={{ marginTop: '2px' }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            className="button-icon-circular"
            title="Refresh Ledger"
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
          </button>

          {/* Primary Coral CTA */}
          <button onClick={onOpenCommandModal} className="button-primary" style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <Plus size={14} /> Dispatch Command
          </button>
        </div>
      </div>

      <style>{`
        @media (min-width: 990px) {
          .desktop-pills {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
