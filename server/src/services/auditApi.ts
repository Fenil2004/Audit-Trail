import type { AuditEvent } from "../types/audit.js";

const API_URL = "http://localhost:5000/api/audit";

interface AuditResponse {
  success: boolean;
  count: number;
  events: AuditEvent[];
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
  const response = await fetch(`${API_URL}/events`);

  if (!response.ok) {
    throw new Error("Failed to fetch audit events");
  }

  const data: AuditResponse = await response.json();

  return data.events;
}