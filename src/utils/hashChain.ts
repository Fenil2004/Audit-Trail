
import type { AuditEvent } from "../types/audit";
import { generateHash } from "./generateHash";

const INITIAL_HASH = "0".repeat(64);

export async function createHashChain(
  events: AuditEvent[]
): Promise<AuditEvent[]> {
  const chainedEvents: AuditEvent[] = [];

  let previousHash = INITIAL_HASH;

  for (const event of events) {
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

    const updatedEvent: AuditEvent = {
      ...event,
      previousHash,
      hash: currentHash,
    };

    chainedEvents.push(updatedEvent);

    previousHash = currentHash;
  }

  return chainedEvents;
}