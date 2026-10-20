import type {
  ShipmentReadModel,
  StoredEvent,
  ReconstructedState,
  TelemetryPoint,
  VerificationResult,
  OperatorPersona,
  CreateShipmentPayload,
} from '../types';

const API_BASE = '/api';

let currentAuthToken: string | null = null;

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
}

export const api = {
  // Token management
  setAuthToken(token: string | null) {
    currentAuthToken = token;
  },

  getAuthToken(): string | null {
    return currentAuthToken;
  },

  // Auth & Personas
  async getPersonas(): Promise<OperatorPersona[]> {
    const res = await fetch(`${API_BASE}/auth/personas`);
    if (!res.ok) throw new Error('Failed to fetch operator personas');
    const data = await res.json();
    return data.data;
  },

  // Queries
  async getShipments(query?: string): Promise<ShipmentReadModel[]> {
    const url = query
      ? `${API_BASE}/queries/shipments?query=${encodeURIComponent(query)}`
      : `${API_BASE}/queries/shipments`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch shipments');
    const data = await res.json();
    return data.data;
  },

  async getShipment(id: string): Promise<ShipmentReadModel> {
    const res = await fetch(`${API_BASE}/queries/shipments/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch shipment ${id}`);
    const data = await res.json();
    return data.data;
  },

  async getEvents(id: string): Promise<StoredEvent[]> {
    const res = await fetch(`${API_BASE}/queries/shipments/${id}/events`);
    if (!res.ok) throw new Error(`Failed to fetch events for ${id}`);
    const data = await res.json();
    return data.data;
  },

  async getStateAt(id: string, version?: number, timestamp?: string): Promise<{ state: ReconstructedState; replayCount: number }> {
    const params = new URLSearchParams();
    if (version !== undefined) params.append('version', version.toString());
    if (timestamp) params.append('timestamp', timestamp);

    const res = await fetch(`${API_BASE}/queries/shipments/${id}/state-at?${params.toString()}`);
    if (!res.ok) throw new Error(`Failed to reconstruct state for ${id}`);
    const data = await res.json();
    return data.data;
  },

  async getTelemetryChart(id: string): Promise<TelemetryPoint[]> {
    const res = await fetch(`${API_BASE}/queries/shipments/${id}/telemetry-chart`);
    if (!res.ok) throw new Error(`Failed to fetch telemetry chart for ${id}`);
    const data = await res.json();
    return data.data;
  },

  async verifyAudit(id: string): Promise<VerificationResult> {
    const res = await fetch(`${API_BASE}/queries/shipments/${id}/audit-verification`);
    if (!res.ok) throw new Error(`Failed to verify audit for ${id}`);
    const data = await res.json();
    return data.data;
  },

  // Commands
  async createShipment(body: CreateShipmentPayload) {
    const res = await fetch(`${API_BASE}/commands/shipments/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  async recordTelemetry(body: {
    aggregateId: string;
    expectedVersion: number;
    location: string;
    temperature: number;
    humidity: number;
    shockDetected?: boolean;
    actor: string;
    role?: string;
  }) {
    const res = await fetch(`${API_BASE}/commands/shipments/record-telemetry`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  async dispatchShipment(body: {
    aggregateId: string;
    expectedVersion: number;
    carrierName: string;
    carrierType: string;
    voyageOrFlightNumber: string;
    departureHub: string;
    custodian: string;
    actor: string;
  }) {
    const res = await fetch(`${API_BASE}/commands/shipments/dispatch`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  async inspectCustoms(body: {
    aggregateId: string;
    expectedVersion: number;
    portCode: string;
    inspectorName: string;
    inspectionResult: 'PASSED' | 'FLAGGED_FOR_AUDIT' | 'QUARANTINED';
    sealIntact: boolean;
    notes: string;
    actor: string;
  }) {
    const res = await fetch(`${API_BASE}/commands/shipments/inspect-customs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  async arriveAtDestination(body: {
    aggregateId: string;
    expectedVersion: number;
    destinationHub: string;
    finalCondition?: 'PRISTINE' | 'COMPROMISED' | 'PENDING_SURVEY';
    receivedBy: string;
    notes?: string;
    actor: string;
  }) {
    const res = await fetch(`${API_BASE}/commands/shipments/arrive`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  },

  async simulateTamperAttack(aggregateId: string) {
    const res = await fetch(`${API_BASE}/commands/shipments/simulate-tamper-attack`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ aggregateId }),
    });
    const json = await res.json();
    return json.data;
  },

  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },
};
