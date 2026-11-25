export type AuditEventStatus = "SUCCESS" | "PENDING" | "FLAGGED";

export interface AuditEvent {
  id: string;
  shipmentId?: string;
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  status: AuditEventStatus;
  hash: string;
}

export const auditEvents: AuditEvent[] = [];