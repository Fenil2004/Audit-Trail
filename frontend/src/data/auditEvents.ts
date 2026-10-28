export interface AuditEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  status: "VERIFIED" | "PENDING" | "FLAGGED";
  hash: string;
}

export const auditEvents: AuditEvent[] = [
  {
    id: "EVT-001",
    title: "Shipment Created",
    description: "A new shipment was registered in the audit system.",
    actor: "Logistics Director",
    timestamp: "2026-10-22T09:00:00Z",
    status: "VERIFIED",
    hash: "a3f8b7c2d9e1f405a6b8c0d2e4f617293a5b7c9d1e3f5062a4b6c8d0e2f41789",
  },
  {
    id: "EVT-002",
    title: "Shipment Dispatched",
    description: "The shipment was handed over to the carrier.",
    actor: "Dispatcher",
    timestamp: "2026-10-22T10:15:00Z",
    status: "VERIFIED",
    hash: "b4c9d8e1f2a30516b7c8d9e0f1a23456c7d8e9f0a1b2c3d4e5f60718293a4b5c",
  },
  {
    id: "EVT-003",
    title: "Customs Inspection",
    description: "The shipment entered the customs inspection process.",
    actor: "Customs Officer",
    timestamp: "2026-10-22T11:30:00Z",
    status: "PENDING",
    hash: "c5d0e9f2a3b41627d8e9f0a1b2c34567d8e9f0a1b2c3d4e5f60718293a4b5c6d",
  },
  {
    id: "EVT-004",
    title: "IoT Telemetry Recorded",
    description: "Temperature and location telemetry was recorded.",
    actor: "IoT Device SN-8821",
    timestamp: "2026-10-22T12:00:00Z",
    status: "VERIFIED",
    hash: "d6e1f0a3b4c52738e9f0a1b2c3d45678e9f0a1b2c3d4e5f60718293a4b5c6d7e",
  },
];