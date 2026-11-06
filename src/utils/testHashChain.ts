import { createHashChain } from "./hashChain";
import type { AuditEvent } from "../types/audit";

const events: AuditEvent[] = [
  {
    eventId: "EVT-001",
    shipmentId: "SHP-001",
    eventType: "CREATED",
    timestamp: "2026-11-07T09:00:00",
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
    timestamp: "2026-11-07T10:00:00",
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
    timestamp: "2026-11-07T12:00:00",
    actor: "Delivery Agent",
    description: "Shipment delivered",
    status: "success",
    hash: "",
    previousHash: "",
  },
];

async function testHashChain() {
  const result = await createHashChain(events);

  console.log("Generated Hash Chain:");

  result.forEach((event) => {
    console.log("Event:", event.eventId);
    console.log("Previous Hash:", event.previousHash);
    console.log("Current Hash:", event.hash);
    console.log("-----------------------");
  });
}

testHashChain();