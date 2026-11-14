export type AuditEventType =
  | "SHIPMENT_CREATED"
  | "SHIPMENT_DISPATCHED"
  | "TEMPERATURE_RECORDED"
  | "EXCURSION_DETECTED"
  | "SHIPMENT_DELIVERED";

export type AuditStatus =
  | "SUCCESS"
  | "FAILED"
  | "PENDING"
  | "CRITICAL";

export interface AuditEvent {
  eventId: string;
  shipmentId: string;
  eventType: AuditEventType;
  timestamp: string;
  actor: string;
  description: string;
  status: AuditStatus;
  hash: string;
  previousHash: string;
}