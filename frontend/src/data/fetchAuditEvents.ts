
import type { AuditEvent } from "./auditEvents";

const API_BASE_URL = "http://localhost:5000";

export type EventType =
  | "SHIPMENT_CREATED"
  | "SHIPMENT_DISPATCHED"
  | "TEMPERATURE_RECORDED"
  | "EXCURSION_DETECTED"
  | "SHIPMENT_DELIVERED";

export type EventStatus =
  | "SUCCESS"
  | "FAILED"
  | "PENDING"
  | "CRITICAL";

export interface CreateEventInput {
  shipmentId: string;
  eventType: EventType;
  actor: string;
  description: string;
  status: EventStatus;
}

export interface UpdateEventInput {
  actor?: string;
  description?: string;
  status?: EventStatus;
}

interface BackendAuditEvent {
  eventId: string;
  shipmentId: string;
  eventType: string;
  timestamp: string;
  actor: string;
  description: string;
  status: string;
  hash: string;
  previousHash: string;
}

interface AuditEventsResponse {
  success: boolean;
  count: number;
  events: BackendAuditEvent[];
}

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data as T;
}

function mapEvent(event: BackendAuditEvent): AuditEvent {
  return {
    id: event.eventId,
    title: event.eventType
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    description: event.description,
    actor: event.actor,
    timestamp: event.timestamp,
    status:
      event.status === "SUCCESS"
        ? "SUCCESS"
        : event.status === "CRITICAL" || event.status === "FAILED"
          ? "FLAGGED"
          : "PENDING",
    hash: event.hash,
  };
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const data = await apiRequest<AuditEventsResponse>("/api/audit/events");

  if (!Array.isArray(data.events)) {
    throw new Error("Invalid audit events response");
  }

  return data.events.map(mapEvent);
}

export async function createAuditEvent(
  input: CreateEventInput,
): Promise<void> {
  await apiRequest("/api/audit/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAuditEvent(
  id: string,
  updates: UpdateEventInput,
): Promise<void> {
  await apiRequest(`/api/audit/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteAuditEvent(id: string): Promise<void> {
  await apiRequest(`/api/audit/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
