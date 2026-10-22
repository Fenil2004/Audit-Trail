import {
  CommandSchema,
  type Command,
} from './commandSchemas';

/**
 * Validates incoming command data before it is processed.
 * Invalid payloads are returned as validation errors.
 */
export function validateIncomingCommand(input: unknown) {
  const result = CommandSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false as const,
      errors: result.error.issues,
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}

/**
 * Returns a validated command or null when validation fails.
 */
export function parseIncomingCommand(
  input: unknown
): Command | null {
  const result = validateIncomingCommand(input);

  if (!result.success) {
    return null;
  }

  return result.data;
}
