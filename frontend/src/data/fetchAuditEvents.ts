import type { AuditEvent } from "./auditEvents";

const API_BASE_URL = "http://localhost:5000";

interface AuditEventsResponse {
success: boolean;
count: number;
events: AuditEvent[];
}

export async function fetchAuditEvents(): Promise<AuditEvent[]> {
const response = await fetch(`${API_BASE_URL}/api/audit/events`);

if (!response.ok) {
throw new Error(`Failed to load audit events: ${response.status}`);
}

const data: AuditEventsResponse = await response.json();

if (!data.success || !Array.isArray(data.events)) {
throw new Error("Invalid audit events response");
}

return data.events;
}

export async function verifyAuditHash(id: string) {
const response = await fetch(
`${API_BASE_URL}/api/audit/verify/${encodeURIComponent(id)}`
);

const data = await response.json();

if (!response.ok) {
throw new Error(data.message || "Hash verification failed");
}

return data.verification as {
id: string;
storedHash: string;
calculatedHash: string;
valid: boolean;
status: string;
};
}
