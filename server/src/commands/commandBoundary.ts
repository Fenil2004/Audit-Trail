
import { z } from 'zod';
import {
    CommandIdSchema,
    ShipmentIdSchema,
    VersionSchema,
} from './commandSchemas';

// Shared boundary invariants for command inputs.
export const CommandBoundarySchema = z
  .object({
    commandId: CommandIdSchema,
    shipmentId: ShipmentIdSchema,
    expectedVersion: VersionSchema.optional(),
  })
  .strict();

// Validate common command boundary fields.
export function validateCommandBoundary(input: unknown) {
  return CommandBoundarySchema.safeParse(input);
}