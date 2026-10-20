/**
 * Type definitions for Audit Trail client
 */

export interface StoredEvent {
  _id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  version: number;
  payload: Record<string, any>;
  metadata: {
    actor: string;
    role?: string;
    ipAddress?: string;
    reason?: string;
    correlationId?: string;
  };
  timestamp: string;
  prevHash: string;
  eventHash: string;
}

export interface ShipmentReadModel {
  _id: string;
  aggregateId: string;
  containerNumber: string;
  origin: string;
  destination: string;
  currentLocation: string;
  status: 'CREATED' | 'IN_TRANSIT' | 'EXCURSION_ALERT' | 'CUSTOMS_HOLD' | 'DELIVERED';
  currentTemperature?: number;
  minTempLimit: number;
  maxTempLimit: number;
  excursionCount: number;
  cargoDescription: string;
  currentCustodian: string;
  version: number;
  lastEventTimestamp: string;
  lastEventHash: string;
  updatedAt: string;
}

export interface ReconstructedState {
  aggregateId: string;
  version: number;
  status: string;
  containerNumber: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  minTempLimit: number;
  maxTempLimit: number;
  currentLocation: string;
  currentTemperature?: number;
  currentCustodian: string;
  sealNumber?: string;
  excursionCount: number;
  lastEventTimestamp: string;
  lastEventHash: string;
}

export interface TelemetryPoint {
  timestamp: string;
  version: number;
  temperature: number | null;
  humidity: number | null;
  location: string;
  eventType: string;
  isExcursion?: boolean;
  notes?: string;
}

export interface EventVerificationStatus {
  version: number;
  eventType: string;
  timestamp: string;
  recordedHash: string;
  computedHash: string;
  prevHash: string;
  matches: boolean;
  tampered: boolean;
}

export interface VerificationResult {
  aggregateId: string;
  totalEvents: number;
  isValid: boolean;
  genesisValid: boolean;
  unbrokenChain: boolean;
  events: EventVerificationStatus[];
  verificationTimestamp: string;
  executionTimeMs: number;
}

export interface OperatorPersona {
  id: string;
  name: string;
  role: string;
  organization: string;
  permissions: string[];
  token: string;
}

export interface CreateShipmentPayload {
  aggregateId: string;
  containerNumber: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  quantityUnits: number;
  minTempLimit: number;
  maxTempLimit: number;
  sealNumber: string;
  actor: string;
  role: string;
}
