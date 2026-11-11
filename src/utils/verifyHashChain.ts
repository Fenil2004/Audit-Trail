import type { AuditEvent } from "../types/audit";
import { generateHash } from "./generateHash";

const INITIAL_HASH = "0".repeat(64);

interface VerificationResult {
  valid: boolean;
  message: string;
  invalidEventId?: string;
  checkedEvents: number;
}

export async function verifyHashChain(
  events: AuditEvent[]
): Promise<VerificationResult> {
  let expectedPreviousHash = INITIAL_HASH;

  if (events.length === 0) {
    return {
      valid: false,
      message: "No audit events found.",
      checkedEvents: 0,
    };
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // Check required hashes
    if (!event.hash || !event.previousHash) {
      return {
        valid: false,
        message: "Missing hash information.",
        invalidEventId: event.eventId,
        checkedEvents: i,
      };
    }

    // Check hash format
    const hashPattern = /^[a-f0-9]{64}$/i;

    if (
      !hashPattern.test(event.hash) ||
      !hashPattern.test(event.previousHash)
    ) {
      return {
        valid: false,
        message: "Invalid SHA-256 hash format.",
        invalidEventId: event.eventId,
        checkedEvents: i,
      };
    }

    // Verify previous hash link
    if (event.previousHash !== expectedPreviousHash) {
      return {
        valid: false,
        message: "Previous hash does not match.",
        invalidEventId: event.eventId,
        checkedEvents: i,
      };
    }

    // Recreate original event data
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

    // Generate hash again
    const calculatedHash = await generateHash(eventData);

    // Compare calculated hash with stored hash
    if (calculatedHash !== event.hash) {
      return {
        valid: false,
        message: "Event data has been modified.",
        invalidEventId: event.eventId,
        checkedEvents: i,
      };
    }

    expectedPreviousHash = calculatedHash;
  }

  return {
    valid: true,
    message: "Hash chain verified successfully.",
    checkedEvents: events.length,
  };
}