import { z } from "zod";

// Validate excursion measurement data
export const excursionMeasurementSchema = z.object({
  aggregateId: z
    .string()
    .min(1, "Aggregate ID is required"),

  location: z
    .string()
    .min(1, "Location is required"),

  measuredValue: z
    .number()
    .finite("Measured value must be a valid number"),

  threshold: z
    .number()
    .finite("Threshold must be a valid number")
    .nonnegative("Threshold cannot be negative"),
});

// Validate alarm status updates
export const alarmStatusSchema = z.object({
  status: z.enum(["ACKNOWLEDGED", "RESOLVED"]),
});

// Export TypeScript types
export type ExcursionMeasurementInput = z.infer<
  typeof excursionMeasurementSchema
>;

export type AlarmStatusInput = z.infer<
  typeof alarmStatusSchema
>;

// Validate measurement data
export function validateExcursionMeasurement(data: unknown) {
  return excursionMeasurementSchema.safeParse(data);
}

// Validate alarm status
export function validateAlarmStatus(data: unknown) {
  return alarmStatusSchema.safeParse(data);
}
