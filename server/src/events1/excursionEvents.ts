export type ExcursionEventType =
  | "EXCURSION_DETECTED"
  | "ALARM_CREATED"
  | "ALARM_ACKNOWLEDGED"
  | "ALARM_RESOLVED";

export interface ExcursionEvent {
  id: string;
  type: ExcursionEventType;
  aggregateId: string;
  alarmId?: string;
  measuredValue?: number;
  threshold?: number;
  message: string;
  timestamp: string;
}

const excursionEvents: ExcursionEvent[] = [];

export const recordExcursionEvent = (
  event: Omit<ExcursionEvent, "id" | "timestamp">
):