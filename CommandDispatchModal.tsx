import React, { useState } from 'react';
import { X, Send, RefreshCw, PlusCircle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import type { ShipmentReadModel, OperatorPersona } from '../types';

interface CommandDispatchModalProps {
  shipment: ShipmentReadModel | null;
  isOpen: boolean;
  onClose: () => void;
  onCommandSuccess: () => void;
  onShipmentCreated?: (newId: string) => void;
  activePersona?: OperatorPersona | null;
}

type CommandType = 'RECORD_TELEMETRY' | 'DISPATCH' | 'CUSTOMS' | 'ARRIVE' | 'CREATE_CONTAINER';

export const CommandDispatchModal: React.FC<CommandDispatchModalProps> = ({
  shipment,
  isOpen,
  onClose,
  onCommandSuccess,
  onShipmentCreated,
  activePersona = null,
}) => {
  const [selectedCommand, setSelectedCommand] = useState<CommandType>('RECORD_TELEMETRY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields - Existing Shipment (initialized directly from fresh shipment prop on modal open)
  const currentVersion = shipment?.version ?? 0;
  const [occVersion, setOccVersion] = useState<number>(currentVersion);
  const [temperature, setTemperature] = useState<number>(shipment?.currentTemperature ?? -18);
  const [humidity, setHumidity] = useState<number>(45);
  const [location, setLocation] = useState<string>(shipment?.currentLocation || 'Frankfurt Airport Transit Hub');
  const [carrierName, setCarrierName] = useState<string>('Lufthansa Cargo');
  const [carrierType, setCarrierType] = useState<string>('FLIGHT');
  const [voyageNumber, setVoyageNumber] = useState<string>('LH-8220');
  const [custodian, setCustodian] = useState<string>('Senior Logistics Officer K. Miller');
  const [portCode, setPortCode] = useState<string>('FRA-CARGO');
  const [inspectorName, setInspectorName] = useState<string>('Officer K. Lim');
  const [inspectionResult, setInspectionResult] = useState<'PASSED' | 'FLAGGED_FOR_AUDIT' | 'QUARANTINED'>('PASSED');
  const [destinationHub, setDestinationHub] = useState<string>(shipment?.destination || 'Central Regional Hub');
  const [receivedBy, setReceivedBy] = useState<string>('Warehouse QA Lead S. Chen');

  // Form Fields - New Container Genesis
  const [newAggregateId, setNewAggregateId] = useState<string>('SHIP-CRYO-1044');
  const [newContainerNumber, setNewContainerNumber] = useState<string>('CONT-BIO-3301');
  const [newOrigin, setNewOrigin] = useState<string>('Basel BioPharma Logistics Center (BSL)');
  const [newDestination, setNewDestination] = useState<string>('Tokyo Narita Cryo Storage (NRT)');
  const [newCargoDescription, setNewCargoDescription] = useState<string>('5,000 Doses Monoclonal Antibodies');
  const [newQuantityUnits, setNewQuantityUnits] = useState<number>(5000);
  const [newMinTempLimit, setNewMinTempLimit] = useState<number>(-20);
  const [newMaxTempLimit, setNewMaxTempLimit] = useState<number>(-10);
  const [newSealNumber, setNewSealNumber] = useState<string>('SEAL-CH-99214');

  if (!isOpen) return null;

  const currentActor = activePersona?.name || 'Logistics Field Agent';
  const currentRole = activePersona?.role || 'OPERATOR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (selectedCommand === 'CREATE_CONTAINER') {
        if (newMinTempLimit >= newMaxTempLimit) {
          throw new Error('Min Temperature Limit must be strictly less than Max Temperature Limit.');
        }

        const res = await api.createShipment({
          aggregateId: newAggregateId.trim().toUpperCase(),
          containerNumber: newContainerNumber.trim(),
          origin: newOrigin.trim(),
          destination: newDestination.trim(),
          cargoDescription: newCargoDescription.trim(),
          quantityUnits: Number(newQuantityUnits),
          minTempLimit: Number(newMinTempLimit),
          maxTempLimit: Number(newMaxTempLimit),
          sealNumber: newSealNumber.trim(),
          actor: currentActor,
          role: currentRole,
        });

        setSuccessMsg(`✓ Genesis Container created! Version 1 appended with hash ${res.data?.eventHash?.slice(0, 16)}...`);
        setTimeout(() => {
          onCommandSuccess();
          if (onShipmentCreated) {
            onShipmentCreated(newAggregateId.trim().toUpperCase());
          }
          onClose();
        }, 1200);
        return;
      }

      if (!shipment) {
        throw new Error('Please select an active shipment to issue this command.');
      }

      const safeExpectedVersion = Number.isInteger(Number(occVersion))
        ? Number(occVersion)
        : (shipment?.version ?? 0);

      const safeTemp = Number.isFinite(Number(temperature))
        ? Number(temperature)
        : (shipment?.currentTemperature ?? -18);

      const safeHumidity = Number.isFinite(Number(humidity))
        ? Math.max(0, Math.min(100, Number(humidity)))
        : 45;

      const safeLocation = (location && location.trim().length >= 2)
        ? location.trim()
        : (shipment?.currentLocation || 'Departure Transit Hold');

      if (selectedCommand === 'RECORD_TELEMETRY') {
        const res = await api.recordTelemetry({
          aggregateId: shipment.aggregateId,
          expectedVersion: safeExpectedVersion,
          location: safeLocation,
          temperature: safeTemp,
          humidity: safeHumidity,
          actor: currentActor,
          role: currentRole,
        });
        setSuccessMsg(res.message || '✓ Telemetry recorded and event appended!');
      } else if (selectedCommand === 'DISPATCH') {
        const validCarrierType = (['VESSEL', 'FLIGHT', 'TRUCK', 'RAIL'].includes(carrierType)
          ? carrierType
          : 'FLIGHT') as 'VESSEL' | 'FLIGHT' | 'TRUCK' | 'RAIL';

        const res = await api.dispatchShipment({
          aggregateId: shipment.aggregateId,
          expectedVersion: safeExpectedVersion,
          carrierName: (carrierName && carrierName.trim().length >= 2) ? carrierName.trim() : 'Global Freight Carrier',
          carrierType: validCarrierType,
          voyageOrFlightNumber: (voyageNumber && voyageNumber.trim().length >= 2) ? voyageNumber.trim() : 'V-1001',
          departureHub: safeLocation,
          custodian: (custodian && custodian.trim().length >= 2) ? custodian.trim() : 'Operations Officer',
          actor: currentActor,
        });
        setSuccessMsg(res.message || '✓ Carrier dispatched and event appended!');
      } else if (selectedCommand === 'CUSTOMS') {
        const res = await api.inspectCustoms({
          aggregateId: shipment.aggregateId,
          expectedVersion: safeExpectedVersion,
          portCode: (portCode && portCode.trim().length >= 2) ? portCode.trim() : 'PORT-CHK',
          inspectorName: (inspectorName && inspectorName.trim().length >= 2) ? inspectorName.trim() : currentActor,
          inspectionResult,
          sealIntact: true,
          notes: 'Routine border seal inspection',
          actor: currentActor,
        });
        setSuccessMsg(res.message || '✓ Customs checkpoint logged and event appended!');
      } else if (selectedCommand === 'ARRIVE') {
        const res = await api.arriveAtDestination({
          aggregateId: shipment.aggregateId,
          expectedVersion: safeExpectedVersion,
          destinationHub: (destinationHub && destinationHub.trim().length >= 2) ? destinationHub.trim() : 'Central Hub',
          receivedBy: (receivedBy && receivedBy.trim().length >= 2) ? receivedBy.trim() : currentActor,
          finalCondition: 'PRISTINE',
          actor: currentActor,
        });
        setSuccessMsg(res.message || '✓ Destination arrival confirmed and event appended!');
      }

      setTimeout(() => {
        onCommandSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Command submission error:', err);
      const msg = err.message || (err.errors ? JSON.stringify(err.errors) : 'Command execution failed.');
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 className="title-lg" style={{ color: 'var(--color-ink)' }}>Dispatch Domain Command</h3>
            <p className="body-sm" style={{ color: 'var(--color-muted)' }}>
              Target: <strong className="code-font" style={{ color: 'var(--color-ink)' }}>{selectedCommand === 'CREATE_CONTAINER' ? 'New Genesis Aggregate' : shipment?.aggregateId}</strong>
            </p>
          </div>
          <button onClick={onClose} className="button-icon-circular" title="Close">
            <X size={16} />
          </button>
        </div>

        {/* Authenticated JWT Identity Banner */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-soft)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--rounded-md)',
            padding: '8px 12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--color-success)" />
            <span>
              Signer: <strong>{currentActor}</strong> ({currentRole})
            </span>
          </div>
          <span className="badge-pill" style={{ fontSize: '9px', backgroundColor: 'rgba(93, 184, 114, 0.15)', color: 'var(--color-success)' }}>
            HMAC-SHA256 JWT
          </span>
        </div>

        {/* Command Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {(['RECORD_TELEMETRY', 'DISPATCH', 'CUSTOMS', 'ARRIVE', 'CREATE_CONTAINER'] as CommandType[]).map((cmd) => {
            const isSelected = selectedCommand === cmd;
            const labels: Record<CommandType, string> = {
              RECORD_TELEMETRY: 'IoT Telemetry',
              DISPATCH: 'Dispatch Carrier',
              CUSTOMS: 'Customs Check',
              ARRIVE: 'Arrive Destination',
              CREATE_CONTAINER: '+ New Container',
            };
            return (
              <button
                key={cmd}
                type="button"
                onClick={() => setSelectedCommand(cmd)}
                className={isSelected ? 'category-tab category-tab-active' : 'category-tab'}
                style={{
                  fontSize: '11px',
                  padding: '5px 10px',
                  fontWeight: isSelected ? 600 : 400,
                  border: isSelected ? '1px solid var(--color-hairline)' : '1px solid transparent',
                  color: cmd === 'CREATE_CONTAINER' && !isSelected ? 'var(--color-primary)' : undefined,
                }}
              >
                {cmd === 'CREATE_CONTAINER' && <PlusCircle size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />}
                {labels[cmd]}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* CREATE NEW CONTAINER FORM */}
          {selectedCommand === 'CREATE_CONTAINER' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Aggregate ID (Unique)
                  </label>
                  <input
                    type="text"
                    value={newAggregateId}
                    onChange={(e) => setNewAggregateId(e.target.value)}
                    className="text-input"
                    style={{ width: '100%', fontFamily: 'var(--font-code)', fontSize: '12px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Container Number
                  </label>
                  <input
                    type="text"
                    value={newContainerNumber}
                    onChange={(e) => setNewContainerNumber(e.target.value)}
                    className="text-input"
                    style={{ width: '100%', fontFamily: 'var(--font-code)', fontSize: '12px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Origin Hub
                  </label>
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="text-input"
                    style={{ width: '100%', fontSize: '12px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Destination Hub
                  </label>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="text-input"
                    style={{ width: '100%', fontSize: '12px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                  Cargo Manifest Description
                </label>
                <input
                  type="text"
                  value={newCargoDescription}
                  onChange={(e) => setNewCargoDescription(e.target.value)}
                  className="text-input"
                  style={{ width: '100%', fontSize: '12px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantityUnits}
                    onChange={(e) => setNewQuantityUnits(Number(e.target.value))}
                    className="text-input"
                    style={{ width: '100%', fontSize: '12px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Min Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMinTempLimit}
                    onChange={(e) => setNewMinTempLimit(Number(e.target.value))}
                    className="text-input"
                    style={{ width: '100%', fontSize: '12px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Max Temp (°C)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newMaxTempLimit}
                    onChange={(e) => setNewMaxTempLimit(Number(e.target.value))}
                    className="text-input"
                    style={{ width: '100%', fontSize: '12px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                    Initial Seal #
                  </label>
                  <input
                    type="text"
                    value={newSealNumber}
                    onChange={(e) => setNewSealNumber(e.target.value)}
                    className="text-input"
                    style={{ width: '100%', fontFamily: 'var(--font-code)', fontSize: '12px' }}
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Optimistic Concurrency Control (OCC) Field */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface-soft)',
                  borderRadius: 'var(--rounded-sm)',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--color-hairline)',
                }}
              >
                <div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)' }}>Optimistic Concurrency (OCC):</span>
                  <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                    Current DB Version: <strong>v{shipment?.version}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--color-body)' }}>Expected Version:</label>
                  <input
                    type="number"
                    value={occVersion}
                    onChange={(e) => setOccVersion(parseInt(e.target.value, 10))}
                    style={{
                      width: '60px',
                      padding: '4px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-hairline)',
                      fontFamily: 'var(--font-code)',
                      fontSize: '12px',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-canvas)',
                      color: occVersion !== shipment?.version ? 'var(--color-error)' : 'var(--color-primary)',
                      fontWeight: 600,
                    }}
                  />
                </div>
              </div>

              {/* Form by Command Type */}
              {selectedCommand === 'RECORD_TELEMETRY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Relative Humidity (%)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={humidity}
                        onChange={(e) => setHumidity(parseInt(e.target.value, 10))}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                      Location / Transit Waypoint
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="text-input"
                      style={{ width: '100%', fontSize: '12px' }}
                      required
                    />
                  </div>
                </div>
              )}

              {selectedCommand === 'DISPATCH' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Carrier Name
                      </label>
                      <input
                        type="text"
                        value={carrierName}
                        onChange={(e) => setCarrierName(e.target.value)}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Carrier Type
                      </label>
                      <select
                        value={carrierType}
                        onChange={(e) => setCarrierType(e.target.value)}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                      >
                        <option value="FLIGHT">Air Cargo (FLIGHT)</option>
                        <option value="VESSEL">Ocean Freight (VESSEL)</option>
                        <option value="TRUCK">Reefer Truck (TRUCK)</option>
                        <option value="RAIL">Intermodal Rail (RAIL)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Voyage / Flight #
                      </label>
                      <input
                        type="text"
                        value={voyageNumber}
                        onChange={(e) => setVoyageNumber(e.target.value)}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Designated Custodian
                      </label>
                      <input
                        type="text"
                        value={custodian}
                        onChange={(e) => setCustodian(e.target.value)}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedCommand === 'CUSTOMS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Port Code
                      </label>
                      <input
                        type="text"
                        value={portCode}
                        onChange={(e) => setPortCode(e.target.value)}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                        Inspection Verdict
                      </label>
                      <select
                        value={inspectionResult}
                        onChange={(e) => setInspectionResult(e.target.value as any)}
                        className="text-input"
                        style={{ width: '100%', fontSize: '12px' }}
                      >
                        <option value="PASSED">PASSED (Release)</option>
                        <option value="FLAGGED_FOR_AUDIT">FLAGGED FOR AUDIT</option>
                        <option value="QUARANTINED">QUARANTINED (Hold)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                      Inspecting Officer Name
                    </label>
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="text-input"
                      style={{ width: '100%', fontSize: '12px' }}
                      required
                    />
                  </div>
                </div>
              )}

              {selectedCommand === 'ARRIVE' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                      Destination Hub
                    </label>
                    <input
                      type="text"
                      value={destinationHub}
                      onChange={(e) => setDestinationHub(e.target.value)}
                      className="text-input"
                      style={{ width: '100%', fontSize: '12px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
                      Received By
                    </label>
                    <input
                      type="text"
                      value={receivedBy}
                      onChange={(e) => setReceivedBy(e.target.value)}
                      className="text-input"
                      style={{ width: '100%', fontSize: '12px' }}
                      required
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(198, 69, 69, 0.1)',
                border: '1px solid var(--color-error)',
                color: 'var(--color-error)',
                fontSize: '12px',
                marginTop: '16px',
              }}
            >
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(93, 184, 114, 0.1)',
                border: '1px solid var(--color-success)',
                color: 'var(--color-success)',
                fontSize: '12px',
                marginTop: '16px',
              }}
            >
              {successMsg}
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="button-secondary" style={{ height: '36px', fontSize: '12px' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="button-primary" style={{ height: '36px', fontSize: '12px' }}>
              {isSubmitting ? <RefreshCw size={13} className="spin" /> : <Send size={13} />}
              {isSubmitting ? 'Appending Event...' : selectedCommand === 'CREATE_CONTAINER' ? 'Create Genesis Container' : 'Append Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
