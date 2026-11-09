import type { AuditEvent } from "../types/audit";
import { generateHash } from "../utils/genrateHash";

const INITIAL_HASH = "0".repeat(64);

export async function verifyHashChain(
  events: AuditEvent[]
): Promise<boolean> {
  let expectedPreviousHash = INITIAL_HASH;

  for (const event of events) {
    if (event.previousHash !== expectedPreviousHash) {
      return false;
    }

    const eventData = JSON.stringify({
      eventId: event.eventId,
      shipmentId: event.shipmentId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      actor: event.actor,
      description: event.description,
      status: event.status,
      previousHash: event.previousHash,
    });

    const calculatedHash = await generateHash(eventData);

    if (calculatedHash !== event.hash) {
      return false;
    }

    expectedPreviousHash = calculatedHash;
  }

  return true;
}