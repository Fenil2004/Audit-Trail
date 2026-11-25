import { getDB } from "../config/db.js";

export type ShipmentStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "DELIVERED";

export interface ShipmentDocument {
  shipmentId: string;
  title: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function getShipmentCollection() {
  return getDB().collection<ShipmentDocument>("shipments");
}

export async function initializeShipmentIndexes(): Promise<void> {
  await getShipmentCollection().createIndex(
    { shipmentId: 1 },
    { unique: true },
  );

  await getShipmentCollection().createIndex({ status: 1 });
  await getShipmentCollection().createIndex({ createdAt: -1 });
}