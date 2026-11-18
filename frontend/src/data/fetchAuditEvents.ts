import type { AuditEvent } from "./auditEvents";

const API_BASE_URL = "http://localhost:5000";

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

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/audit/events`
  );

  if (!response.ok) {
    throw new Error(`Failed to load events: ${response.status}`);
  }

  const data: AuditEventsResponse = await response.json();

  if (!data.success || !Array.isArray(data.events)) {
    throw new Error("Invalid audit events response");
  }

  return data.events.map((event) => ({
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
        : event.status === "FLAGGED"
          ? "FLAGGED"
          : "PENDING",
    hash: event.hash,
  }));
}