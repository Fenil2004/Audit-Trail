import type { AuditEvent } from "../types/audit";
import { generateHash } from "./generateHash";

const INITIAL_HASH = "0".repeat(64);

export async function createHashChain(
  events: AuditEvent[]
): Promise<AuditEvent[]> {
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime()
  );

  const chainedEvents: AuditEvent[] = [];

  let previousHash = INITIAL_HASH;

  for (const event of sortedEvents) {
    const eventData = JSON.stringify({
      eventId: event.eventId,
      shipmentId: event.shipmentId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      actor: event.actor,
      description: event.description,
      status: event.status,
      previousHash,
    });

    const currentHash = await generateHash(eventData);

    const chainedEvent: AuditEvent = {
      ...event,
      previousHash,
      hash: currentHash,
    };

    chainedEvents.push(chainedEvent);

    previousHash = currentHash;
  }

  return chainedEvents;
}