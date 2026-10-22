import { createHash } from "node:crypto";

export type AuditStatus = "VERIFIED" | "PENDING" | "FLAGGED";

export interface AuditEvent {
id: string;
title: string;
description: string;
actor: string;
timestamp: string;
status: AuditStatus;
hash: string;
}

interface EventInput {
id: string;
title: string;
description: string;
actor: string;
timestamp: string;
}

function calculateHash(event: EventInput): string {
// Fixed property order makes the JSON representation deterministic.
const canonicalData = JSON.stringify({
id: event.id,
title: event.title,
description: event.description,
actor: event.actor,
timestamp: event.timestamp,
});

return createHash("sha256").update(canonicalData, "utf8").digest("hex");
}

const initialEvents: EventInput[] = [
{
id: "EVT-001",
title: "Shipment Created",
description: "A new shipment was registered in the audit system.",
actor: "Logistics Director",
timestamp: "2026-10-22T09:00:00.000Z",
},
{
id: "EVT-002",
title: "Shipment Dispatched",
description: "The shipment was handed over to the carrier.",
actor: "Dispatcher",
timestamp: "2026-10-22T10:15:00.000Z",
},
{
id: "EVT-003",
title: "Customs Inspection",
description: "The shipment entered the customs inspection process.",
actor: "Customs Officer",
timestamp: "2026-10-22T11:30:00.000Z",
},
{
id: "EVT-004",
title: "IoT Telemetry Recorded",
description: "Temperature and location telemetry was recorded.",
actor: "IoT Device SN-8821",
timestamp: "2026-10-22T12:00:00.000Z",
},
];

// In-memory demo storage. Events are lost when the server restarts.
const events: AuditEvent[] = initialEvents.map((event, index) => ({
...event,
status: index === 2 ? "PENDING" : "VERIFIED",
hash: calculateHash(event),
}));

export function getAuditEvents(): AuditEvent[] {
return [...events].sort(
(a, b) =>
new Date(a.timestamp).getTime() -
new Date(b.timestamp).getTime()
);
}

export function verifyAuditEvent(id: string) {
const event = events.find((item) => item.id === id);

if (!event) {
return null;
}

const { hash, status, ...eventContent } = event;
const calculatedHash = calculateHash(eventContent);

return {
id: event.id,
storedHash: hash,
calculatedHash,
valid: hash === calculatedHash,
status,
};
}
