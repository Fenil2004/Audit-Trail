import "dotenv/config";
import { MongoClient } from "mongodb";
import { createHash } from "node:crypto";

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();

  const db = client.db(
    process.env.MONGODB_DB || "audit_trail"
  );

  const events = await db
    .collection("audit_events")
    .find({ shipmentId: "SHP-001" })
    .sort({ timestamp: 1, eventId: 1 })
    .toArray();

  let previousHash = "GENESIS";
  let valid = true;

  for (const event of events) {
    const payload = JSON.stringify({
      eventId: event.eventId,
      shipmentId: event.shipmentId,
      eventType: event.eventType,
      timestamp: event.timestamp,
      actor: event.actor,
      description: event.description,
      status: event.status,
      previousHash,
    });

    const expectedHash = createHash("sha256")
      .update(payload)
      .digest("hex");

    const hashValid =
      event.hash === expectedHash &&
      /^[a-f0-9]{64}$/.test(event.hash);

    const linkValid =
      event.previousHash === previousHash;

    console.log(
      `${event.eventId} | Hash: ${hashValid ? "PASS" : "FAIL"} | Link: ${linkValid ? "PASS" : "FAIL"}`
    );

    if (!hashValid || !linkValid) {
      valid = false;
    }

    previousHash = event.hash;
  }

  console.log(
    "Overall:",
    valid && events.length === 5 ? "PASS" : "FAIL"
  );
} catch (error) {
  console.error("Verification error:", error.message);
  process.exitCode = 1;
} finally {
  await client.close();
}