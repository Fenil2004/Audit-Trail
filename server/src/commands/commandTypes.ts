import type { z } from 'zod';
import {
  CommandSchema,
  CreateShipmentCommandSchema,
  UpdateShipmentStatusCommandSchema,
} from './commandSchemas';

// Type for creating a shipment
export type CreateShipmentInput = z.infer<
  typeof CreateShipmentCommandSchema
>;

// Type for updating shipment status
export type UpdateShipmentStatusInput = z.infer<
  typeof UpdateShipmentStatusCommandSchema
>;

// Union type for all supported commands
export type WriteCommand = z.infer<typeof CommandSchema>;

// Standard command processing result
export interface CommandServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  commandId?: string;
  aggregateId?: string;
  version?: number;
}