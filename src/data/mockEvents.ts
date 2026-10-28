import type { AuditEvent } from "../types/audit";

export const mockEvents: AuditEvent[] = [
  {
    eventId: "evt-001",
    shipmentId: "SHP-001",
    eventType: "SHIPMENT_CREATED",
    timestamp: "2026-10-29T09:00:00Z",
    actor: "admin",
    description: "Shipment created successfully",
    status: "SUCCESS",
    hash: "a1b2c3d4e5f6",
    previousHash: "000000000000"
  },

  {
    eventId: "evt-002",
    shipmentId: "SHP-001",
    eventType: "SHIPMENT_DISPATCHED",
    timestamp: "2026-10-29T09:30:00Z",
    actor: "warehouse_manager",
    description: "Shipment dispatched from warehouse",
    status: "SUCCESS",
    hash: "b2c3d4e5f6a1",
    previousHash: "a1b2c3d4e5f6"
  },

  {
    eventId: "evt-003",
    shipmentId: "SHP-001",
    eventType: "TEMPERATURE_RECORDED",
    timestamp: "2026-10-29T10:00:00Z",
    actor: "sensor-001",
    description: "Temperature recorded at 4°C",
    status: "SUCCESS",
    hash: "c3d4e5f6a1b2",
    previousHash: "b2c3d4e5f6a1"
  },

  {
    eventId: "evt-004",
    shipmentId: "SHP-001",
    eventType: "EXCURSION_DETECTED",
    timestamp: "2026-10-29T10:30:00Z",
    actor: "sensor-001",
    description: "Temperature excursion detected at 9°C",
    status: "CRITICAL",
    hash: "d4e5f6a1b2c3",
    previousHash: "c3d4e5f6a1b2"
  },

  {
    eventId: "evt-005",
    shipmentId: "SHP-001",
    eventType: "SHIPMENT_DELIVERED",
    timestamp: "2026-10-29T12:00:00Z",
    actor: "delivery_manager",
    description: "Shipment delivered to destination",
    status: "SUCCESS",
    hash: "e5f6a1b2c3d4",
    previousHash: "d4e5f6a1b2c3"
  }
];