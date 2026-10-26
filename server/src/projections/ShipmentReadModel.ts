import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IShipmentReadModel extends Document {
  _id: string; // aggregateId
  aggregateId: string;
  containerNumber: string;
  status: 'UNINITIALIZED' | 'CREATED' | 'IN_TRANSIT' | 'EXCURSION_ALERT' | 'CUSTOMS_INSPECTION' | 'DELIVERED';
  origin: string;
  destination: string;
  cargoDescription: string;
  quantityUnits: number;
  minTempLimit: number;
  maxTempLimit: number;
  currentLocation: string;
  currentTemperature: number | null;
  currentHumidity: number | null;
  currentCarrier: string | null;
  currentCustodian: string | null;
  sealNumber: string | null;
  sealStatus: 'INTACT' | 'BROKEN' | 'REPLACED' | 'UNASSIGNED';
  excursionCount: number;
  version: number;
  lastEventTimestamp: Date;
  lastEventHash: string;
  lastEventType: string;
  updatedAt: Date;
}

const ShipmentReadModelSchema = new Schema<IShipmentReadModel>(
  {
    _id: { type: String, required: true },
    aggregateId: { type: String, required: true, index: true },
    containerNumber: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['UNINITIALIZED', 'CREATED', 'IN_TRANSIT', 'EXCURSION_ALERT', 'CUSTOMS_INSPECTION', 'DELIVERED'],
      index: true,
    },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    cargoDescription: { type: String, required: true },
    quantityUnits: { type: Number, default: 0 },
    minTempLimit: { type: Number, required: true },
    maxTempLimit: { type: Number, required: true },
    currentLocation: { type: String, default: 'PENDING_DISPATCH' },
    currentTemperature: { type: Number, default: null },
    currentHumidity: { type: Number, default: null },
    currentCarrier: { type: String, default: null },
    currentCustodian: { type: String, default: null },
    sealNumber: { type: String, default: null },
    sealStatus: {
      type: String,
      enum: ['INTACT', 'BROKEN', 'REPLACED', 'UNASSIGNED'],
      default: 'UNASSIGNED',
    },
    excursionCount: { type: Number, default: 0 },
    version: { type: Number, required: true, default: 0 },
    lastEventTimestamp: { type: Date, required: true },
    lastEventHash: { type: String, required: true },
    lastEventType: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'shipment_projections',
  }
);

export const ShipmentReadModel: Model<IShipmentReadModel> = mongoose.model<IShipmentReadModel>(
  'ShipmentReadModel',
  ShipmentReadModelSchema
);

// Audit verification (Oct 25): verified compound index performance for temporal state queries.
