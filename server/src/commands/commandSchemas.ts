import { z } from 'zod';

// Valid command identifiers
export const CommandIdSchema = z.string().trim().min(1).max(100);

// Shipment identifier
export const ShipmentIdSchema = z.string().trim().min(1).max(100);

// Non-negative integer version
export const VersionSchema = z.number().int().nonnegative();

// Validate shipment status
export const ShipmentStatusSchema = z.enum([
  'pending',
  'in_transit',
  'delivered',
  'cancelled',
]);

// Base command schema
export const BaseCommandSchema = z.object({
  commandId: CommandIdSchema,
  shipmentId: ShipmentIdSchema,
  expectedVersion: VersionSchema,
}).strict();

// Create shipment command
export const CreateShipmentCommandSchema = z.object({
  type: z.literal('CREATE_SHIPMENT'),
  commandId: CommandIdSchema,
  shipmentId: ShipmentIdSchema,
}).strict();

// Update shipment status command
export const UpdateShipmentStatusCommandSchema = z.object({
  type: z.literal('UPDATE_SHIPMENT_STATUS'),
  commandId: CommandIdSchema,
  shipmentId: ShipmentIdSchema,
  expectedVersion: VersionSchema,
  status: ShipmentStatusSchema,
}).strict();

// Union of supported commands
export const CommandSchema = z.discriminatedUnion('type', [
  CreateShipmentCommandSchema,
  UpdateShipmentStatusCommandSchema,
]);

// Inferred TypeScript contracts
export type BaseCommand = z.infer<typeof BaseCommandSchema>;
export type CreateShipmentCommand = z.infer<
  typeof CreateShipmentCommandSchema
>;
export type UpdateShipmentStatusCommand = z.infer<
  typeof UpdateShipmentStatusCommandSchema
>;
export type Command = z.infer<typeof CommandSchema>;

// Safe command validation
export function validateCommand(input: unknown) {
  return CommandSchema.safeParse(input);
}
