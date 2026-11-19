import { randomUUID } from "node:crypto";

import { getDB } from "../config/db.js";
import { mockEvents } from "../data/mockEvents.js";
import type { AuditEvent } from "../types/audit.js";

const COLLECTION = "audit_events";

export async function seedAuditEvents(): Promise<void> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  await collection.createIndex({ eventId: 1 }, { unique: true });

  const operations = mockEvents.map((event) => ({
    updateOne: {
      filter: { eventId: event.eventId },
      update: { $setOnInsert: event },
      upsert: true,
    },
  }));

  const result = await collection.bulkWrite(operations);

  console.log(`${result.upsertedCount} initial events inserted`);
}

export async function getAuditEvents(): Promise<AuditEvent[]> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  return collection
    .find({}, { projection: { _id: 0 } })
    .sort({ timestamp: 1 })
    .toArray();
}

export async function createAuditEvent(
  input: Pick<
    AuditEvent,
    "shipmentId" | "eventType" | "actor" | "description" | "status"
  >,
): Promise<AuditEvent> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  const event: AuditEvent = {
    ...input,
    eventId: randomUUID(),
    timestamp: new Date().toISOString(),
    hash: "PENDING",
    previousHash: "PENDING",
  };

  await collection.insertOne(event);

  return event;
}

export async function updateAuditEvent(
  id: string,
  updates: Partial<Pick<AuditEvent, "actor" | "description" | "status">>,
): Promise<AuditEvent | null> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  const result = await collection.updateOne(
    { eventId: id },
    { $set: updates },
  );

  if (result.matchedCount === 0) return null;

  return collection.findOne(
    { eventId: id },
    { projection: { _id: 0 } },
  );
}

export async function deleteAuditEvent(id: string): Promise<boolean> {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  const result = await collection.deleteOne({ eventId: id });

  return result.deletedCount > 0;
}

export async function verifyAuditEvent(id: string) {
  const collection = getDB().collection<AuditEvent>(COLLECTION);

  const event = await collection.findOne(
    { eventId: id },
    { projection: { _id: 0 } },
  );

  if (!event) return null;

  return {
    eventId: event.eventId,
    shipmentId: event.shipmentId,
    verificationStatus: "NOT_VERIFIED",
    message: "Cryptographic verification is not implemented yet.",
  };
}