export type EventType =
  | "SHIPMENT_CREATED"
  | "TEMPERATURE_RECORDED"
  | "EXCURSION_DETECTED"
  | "SHIPMENT_DISPATCHED"
  | "SHIPMENT_DELIVERED";

export type EventStatus =
  | "SUCCESS"
  | "WARNING"
  | "CRITICAL";

export interface AuditEvent {
  eventId: string;
  shipmentId: string;
  eventType: EventType;
  timestamp: string;
  actor: string;
  description: string;
  status: EventStatus;
  hash: string;
  previousHash: string;
}