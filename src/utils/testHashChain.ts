import { createHashChain } from "./hashChain";
import { verifyHashChain } from "./verifyHashChain";
import type { AuditEvent } from "../types/audit";

const events: AuditEvent[] = [
  {
    eventId: "EVT-001",
    shipmentId: "SHP-001",
    eventType: "CREATED",
    timestamp: "2026-11-09T09:00:00",
    actor: "Admin",
    description: "Shipment created",
    status: "success",
    hash: "",
    previousHash: "",
  },
  {
    eventId: "EVT-002",
    shipmentId: "SHP-001",
    eventType: "DISPATCHED",
    timestamp: "2026-11-09T10:00:00",
    actor: "Manager",
    description: "Shipment dispatched",
    status: "success",
    hash: "",
    previousHash: "",
  },
  {
    eventId: "EVT-003",
    shipmentId: "SHP-001",
    eventType: "DELIVERED",
    timestamp: "2026-11-09T12:00:00",
    actor: "Agent",
    description: "Shipment delivered",
    status: "success",
    hash: "",
    previousHash: "",
  },
];

async function testHashChain() {
  const chainedEvents = await createHashChain(events);
  chainedEvents[1].actor = "Unknown User";

const tamperedResult = await verifyHashChain(chainedEvents);

console.log("After Tampering:", tamperedResult);

  const isValid = await verifyHashChain(chainedEvents);

  console.log("Hash Chain:", chainedEvents);
  console.log("Verification Result:", isValid);
}

testHashChain();