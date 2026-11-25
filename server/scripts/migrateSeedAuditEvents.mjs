import "dotenv/config";
import { createHash } from "node:crypto";
import { MongoClient } from "mongodb";

const COLLECTION = "audit_events";
const GENESIS_HASH = "GENESIS";

const expectedEvents = [
  {
    eventId: "evt-001",
    shipmentId: "SHP-001",
    eventType: "SHIPMENT_CREATED",
    timestamp: "2026-10-29T09:00:00Z",
    actor: "admin",
    description: "Shipment created successfully",
    status: "SUCCESS",
    oldHash: "a1b2c3d4e5f6",
    oldPreviousHash: "000000000000",
  },
  {
    eventId: "evt-002",
    shipmentId: "SHP-001",
    eventType: "SHIPMENT_DISPATCHED",
    timestamp: "2026-10-29T09:30:00Z",
    actor: "warehouse_manager",
    description: "Shipment dispatched from warehouse",
    status: "SUCCESS",
    oldHash: "b2c3d4e5f6a1",
    oldPreviousHash: "a1b2c3d4e5f6",
  },
  {
    eventId: "evt-003",
    shipmentId: "SHP-001",
    eventType: "TEMPERATURE_RECORDED",
    timestamp: "2026-10-29T10:00:00Z",
    actor: "sensor-001",
    description: "Temperature recorded at 4°C",
    status: "SUCCESS",
    oldHash: "c3d4e5f6a1b2",
    oldPreviousHash: "b2c3d4e5f6a1",
  },
  {
    eventId: "evt-004",
    shipmentId: "SHP-001",
    eventType: "EXCURSION_DETECTED",
    timestamp: "2026-10-29T10:30:00Z",
    actor: "sensor-001",
    description: "Temperature excursion detected at 9°C",
    status: "CRITICAL",
    oldHash: "d4e5f6a1b2c3",
    oldPreviousHash: "c3d4e5f6a1b2",
  },
  {
    eventId: "evt-005",
    shipmentId: "SHP-001",
    eventType: "SHIPMENT_DELIVERED",
    timestamp: "2026-10-29T12:00:00Z",
    actor: "delivery_manager",
    description: "Shipment delivered to destination",
    status: "SUCCESS",
    oldHash: "e5f6a1b2c3d4",
    oldPreviousHash: "d4e5f6a1b2c3",
  },
];

function calculateHash(event) {
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

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();

  const db = client.db(process.env.MONGODB_DB || "audit_trail");
  const collection = db.collection(COLLECTION);
  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const records = await collection
        .find(
          { eventId: { $in: expectedEvents.map((e) => e.eventId) } },
          { session, projection: { _id: 0 } },
        )
        .toArray();

      if (records.length !== expectedEvents.length) {
        throw new Error("Expected five seed records. Migration aborted.");
      }

      const migratedEvents = [];
      let previousHash = GENESIS_HASH;

      for (const expected of expectedEvents) {
        const record = records.find(
          (item) => item.eventId === expected.eventId,
        );

        if (
          !record ||
          record.shipmentId !== expected.shipmentId ||
          record.eventType !== expected.eventType ||
          record.timestamp !== expected.timestamp ||
          record.actor !== expected.actor ||
          record.description !== expected.description ||
          record.status !== expected.status ||
          record.hash !== expected.oldHash ||
          record.previousHash !== expected.oldPreviousHash
        ) {
          throw new Error(
            `Record ${expected.eventId} does not match the original seed data. Migration aborted.`,
          );
        }

        const event = {
          eventId: record.eventId,
          shipmentId: record.shipmentId,
          eventType: record.eventType,
          timestamp: record.timestamp,
          actor: record.actor,
          description: record.description,
          status: record.status,
          previousHash,
        };

        const newHash = calculateHash(event);

        migratedEvents.push({
          eventId: record.eventId,
          oldHash: record.hash,
          previousHash,
          newHash,
        });

        previousHash = newHash;
      }

      for (const event of migratedEvents) {
        const result = await collection.updateOne(
          {
            eventId: event.eventId,
            hash: event.oldHash,
          },
          {
            $set: {
              hash: event.newHash,
              previousHash: event.previousHash,
            },
          },
          { session },
        );

        if (result.modifiedCount !== 1) {
          throw new Error(
            `Migration failed for ${event.eventId}. Transaction aborted.`,
          );
        }
      }
    });

    console.log("Migration completed successfully.");
    console.log("Migrated records: 5");
    console.log("Hash algorithm: SHA-256");
    console.log("Hash chain: SHP-001");
  } finally {
    await session.endSession();
  }
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}