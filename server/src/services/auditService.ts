import { createHash, randomUUID } from "node:crypto";

import { getDB } from "../config/db.js";
import { mockEvents } from "../data/mockEvents.js";
import type { AuditEvent } from "../types/audit.js";

const COLLECTION = "audit_events";
const GENESIS_HASH = "GENESIS";

function calculateHash(
  event: Omit<AuditEvent, "hash">,
): string {
  const payload = JSON.stringify({
    eventId: event.eventId,
    shipmentId: event.shipmentId,
    eventType: event.eventType,
    timestamp: event.timestamp,
    actor: event.actor,
    description: event.description,
    status: event.status,
    previousHash: event.previousHash,
  });

  return createHash("sha256").update(payload).digest("hex");
}

function sortEvents(events: AuditEvent[]): AuditEvent[] {
  return [...events].sort((a, b) => {
    const timeDifference =
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime();

    return timeDifference || a.eventId.localeCompare(b.eventId);
  });
}

export async function seedAuditEvents(): Promise<void> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  await collection.createIndex({ eventId: 1 }, { unique: true });

  const existingEvents = await collection.find({}).toArray();

  if (existingEvents.length > 0) {
    console.log("Existing audit records preserved.");
    return;
  }

  const eventsByShipment = new Map<string, AuditEvent[]>();

  for (const event of mockEvents) {
    const shipmentEvents =
      eventsByShipment.get(event.shipmentId) ?? [];

    shipmentEvents.push(event);
    eventsByShipment.set(event.shipmentId, shipmentEvents);
  }

  const initialEvents: AuditEvent[] = [];

  for (const shipmentEvents of eventsByShipment.values()) {
    let previousHash = GENESIS_HASH;

    for (const originalEvent of sortEvents(shipmentEvents)) {
      const eventWithoutHash = {
        ...originalEvent,
        previousHash,
      };

      const event: AuditEvent = {
        ...eventWithoutHash,
        hash: calculateHash(eventWithoutHash),
      };

      initialEvents.push(event);
      previousHash = event.hash;
    }
  }

  if (initialEvents.length > 0) {
    await collection.insertMany(initialEvents);
  }

  console.log(`${initialEvents.length} initial events inserted.`);
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  const events = await collection
    .find({}, { projection: { _id: 0 } })
    .toArray();

  return sortEvents(events);
}

export async function createAuditEvent(
  input: Pick<
    AuditEvent,
    "shipmentId" | "eventType" | "actor" | "description" | "status"
  >,
): Promise<AuditEvent> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  const previousEvent = await collection
    .find({ shipmentId: input.shipmentId })
    .sort({ timestamp: -1, eventId: -1 })
    .limit(1)
    .next();

  const eventWithoutHash = {
    ...input,
    eventId: randomUUID(),
    timestamp: new Date().toISOString(),
    previousHash: previousEvent?.hash ?? GENESIS_HASH,
  };

  const event: AuditEvent = {
    ...eventWithoutHash,
    hash: calculateHash(eventWithoutHash),
  };

  await collection.insertOne(event);

  return event;
}

export async function verifyAuditEvent(id: string) {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  const targetEvent = await collection.findOne(
    { eventId: id },
    { projection: { _id: 0 } },
  );

  if (!targetEvent) return null;

  const shipmentEvents = await collection
    .find(
      { shipmentId: targetEvent.shipmentId },
      { projection: { _id: 0 } },
    )
    .toArray();

  const sortedEvents = sortEvents(shipmentEvents);

  let expectedPreviousHash = GENESIS_HASH;
  let targetVerified = false;

  for (const event of sortedEvents) {
    const expectedHash = calculateHash({
      eventId: event.eventId,
      shipmentId: event.shipmentId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      actor: event.actor,
      description: event.description,
      status: event.status,
      previousHash: expectedPreviousHash,
    });

    const linkValid = event.previousHash === expectedPreviousHash;
    const hashValid = event.hash === expectedHash;

    if (!linkValid || !hashValid) {
      return {
        eventId: id,
        shipmentId: targetEvent.shipmentId,
        verificationStatus: "TAMPERED",
        message: `Integrity verification failed at event ${event.eventId}.`,
      };
    }

    if (event.eventId === id) {
      targetVerified = true;
    }

    expectedPreviousHash = event.hash;
  }

  return {
    eventId: id,
    shipmentId: targetEvent.shipmentId,
    verificationStatus: targetVerified ? "VERIFIED" : "NOT_VERIFIED",
    message: targetVerified
      ? "The event and its shipment hash chain passed integrity verification."
      : "The event could not be verified.",
  };
}