export type AuditEventType =
  | "CREATED"
  | "DISPATCHED"
  | "DELIVERED";

export type AuditStatus =
  | "success"
  | "failed"
  | "pending";

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