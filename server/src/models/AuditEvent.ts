import { Schema, model } from "mongoose";
import type { AuditEvent } from "../types/audit.js";
export type { AuditEvent } from "../types/audit.js";
const auditEventSchema = new Schema<AuditEvent>(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    shipmentId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "SHIPMENT_CREATED",
        "SHIPMENT_DISPATCHED",
        "TEMPERATURE_RECORDED",
        "EXCURSION_DETECTED",
        "SHIPMENT_DELIVERED",
      ],
    },
    timestamp: {
      type: String,
      required: true,
    },
    actor: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["SUCCESS", "FAILED", "PENDING", "CRITICAL"],
    },
    hash: {
      type: String,
      required: true,
    },
    previousHash: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

export const AuditEventModel = model<AuditEvent>(
  "AuditEvent",
  auditEventSchema
);