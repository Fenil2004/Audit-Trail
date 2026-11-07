import { randomUUID } from "crypto";

export type AlarmStatus =
  | "ACTIVE"
  | "ACKNOWLEDGED"
  | "RESOLVED";

export interface ExcursionMeasurement {
  aggregateId: string;
  location: string;
  measuredValue: number;
  threshold: number;
}

export interface ExcursionAlarm {
  alarmId: string;
  aggregateId: string;
  location: string;
  measuredValue: number;
  threshold: number;
  message: string;
  status: AlarmStatus;
  createdAt: string;
  updatedAt: string;
}

const alarms = new Map<string, ExcursionAlarm>();

/**
 * Detect threshold excursion and generate alarm.
 */
export function evaluateExcursion(
  measurement: ExcursionMeasurement
): ExcursionAlarm | null {
  const {
    aggregateId,
    location,
    measuredValue,
    threshold,
  } = measurement;

  if (
    !aggregateId ||
    !location ||
    !Number.isFinite(measuredValue) ||
    !Number.isFinite(threshold) ||
    threshold < 0
  ) {
    throw new Error("Invalid excursion measurement");
  }

  // Check whether threshold is crossed.
  if (measuredValue <= threshold) {
    return null;
  }

  // Avoid duplicate active alarms for the same aggregate.
  const existingAlarm = Array.from(alarms.values()).find(
    (alarm) =>
      alarm.aggregateId === aggregateId &&
      alarm.status !== "RESOLVED"
  );

  if (existingAlarm) {
    existingAlarm.measuredValue = measuredValue;
    existingAlarm.updatedAt = new Date().toISOString();

    return existingAlarm;
  }

  const now = new Date().toISOString();

  const alarm: ExcursionAlarm = {
    alarmId: randomUUID(),
    aggregateId,
    location,
    measuredValue,
    threshold,
    message: `Excursion detected at ${location}. Value ${measuredValue} exceeded threshold ${threshold}.`,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  };

  // Store alarm event.
  alarms.set(alarm.alarmId, alarm);

  return alarm;
}

/**
 * Get all recorded alarms.
 */
export function getAllAlarms(): ExcursionAlarm[] {
  return Array.from(alarms.values());
}

/**
 * Get alarm by ID.
 */
export function getAlarmById(
  alarmId: string
): ExcursionAlarm | undefined {
  return alarms.get(alarmId);
}

/**
 * Update alarm status.
 */
export function updateAlarmStatus(
  alarmId: string,
  status: AlarmStatus
): ExcursionAlarm {
  const alarm = alarms.get(alarmId);

  if (!alarm) {
    throw new Error("Alarm not found");
  }

  const allowedTransitions: Record<AlarmStatus, AlarmStatus[]> = {
    ACTIVE: ["ACKNOWLEDGED", "RESOLVED"],
    ACKNOWLEDGED: ["RESOLVED"],
    RESOLVED: [],
  };

  if (!allowedTransitions[alarm.status].includes(status)) {
    throw new Error(
      `Cannot change alarm status from ${alarm.status} to ${status}`
    );
  }

  alarm.status = status;
  alarm.updatedAt = new Date().toISOString();

  return alarm;
}
