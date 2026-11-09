import { randomUUID } from "crypto";

export type ExcursionEventType =
  | "EXCURSION_DETECTED"
  | "ALARM_ACKNOWLEDGED"
  | "ALARM_RESOLVED";

export interface ExcursionEvent {
  eventId: string;
  eventType: ExcursionEventType;
  aggregateId: string;
  alarmId: string;
  message: string;
  timestamp: string;
}

const excursionEvents: ExcursionEvent[] = [];

/**
 * Record an excursion event.
 */
export function recordExcursionEvent(
  eventType: ExcursionEventType,
  aggregateId: string,
  alarmId: string,
  message: string
): ExcursionEvent {
  const event: ExcursionEvent = {
    eventId: randomUUID(),
    eventType,
    aggregateId,
    alarmId,
    message,
    timestamp: new Date().toISOString(),
  };

  excursionEvents.push(event);

  return event;
}

/**
 * Get all excursion events.
 */
export function getExcursionEvents(): ExcursionEvent[] {
  return [...excursionEvents];
}

/**
 * Get events for a specific aggregate.
 */
export function getEventsByAggregate(
  aggregateId: string
): ExcursionEvent[] {
  return excursionEvents.filter(
    (event) => event.aggregateId === aggregateId
  );
}
