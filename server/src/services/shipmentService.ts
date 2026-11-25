import { randomUUID } from "node:crypto";

import {
  getShipmentCollection,
  type ShipmentDocument,
  type ShipmentStatus,
} from "../models/Shipment.js";

import { createAuditEvent } from "./auditService.js";

export interface CreateShipmentInput {
  title: string;
  origin: string;
  destination: string;
  expectedDelivery: string;
}

export async function getAllShipments(): Promise<ShipmentDocument[]> {
  return getShipmentCollection()
    .find({}, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getShipmentById(
  shipmentId: string,
): Promise<ShipmentDocument | null> {
  return getShipmentCollection().findOne(
    { shipmentId },
    { projection: { _id: 0 } },
  );
}

export async function createShipment(
  input: CreateShipmentInput,
  actor: string,
): Promise<ShipmentDocument> {
  const now = new Date().toISOString();

  const shipment: ShipmentDocument = {
    shipmentId: `SHP-${randomUUID().slice(0, 8).toUpperCase()}`,
    title: input.title.trim(),
    origin: input.origin.trim(),
    destination: input.destination.trim(),
    status: "CREATED",
    expectedDelivery: input.expectedDelivery,
    createdAt: now,
    updatedAt: now,
    createdBy: actor,
  };

  await getShipmentCollection().insertOne(shipment);

  await createAuditEvent({
    shipmentId: shipment.shipmentId,
    eventType: "SHIPMENT_CREATED",
    actor,
    description: `Shipment created: ${shipment.title}`,
    status: "SUCCESS",
  });

  return shipment;
}

export async function updateShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  actor: string,
): Promise<ShipmentDocument | null> {
  const collection = getShipmentCollection();

  const shipment = await collection.findOne({ shipmentId });

  if (!shipment) {
    return null;
  }

  if (shipment.status === status) {
    throw new Error("Shipment already has this status");
  }

  if (shipment.status === "DELIVERED") {
    throw new Error("Delivered shipments cannot be updated");
  }

  const eventType =
    status === "IN_TRANSIT"
      ? "SHIPMENT_DISPATCHED"
      : "SHIPMENT_DELIVERED";

  const updatedAt = new Date().toISOString();

  await collection.updateOne(
    { shipmentId },
    {
      $set: {
        status,
        updatedAt,
      },
    },
  );

  await createAuditEvent({
    shipmentId,
    eventType,
    actor,
    description: `Shipment status changed from ${shipment.status} to ${status}`,
    status: "SUCCESS",
  });

  return collection.findOne(
    { shipmentId },
    { projection: { _id: 0 } },
  );
}