import type { AuditEvent } from "../types/audit";
import { verifyHashChain } from "./verifyHashChain";

interface TamperDetectionResult {
  tampered: boolean;
  message: string;
  invalidEventId?: string;
  checkedEvents: number;
}

export async function detectTampering(
  events: AuditEvent[]
): Promise<TamperDetectionResult> {
  const verification = await verifyHashChain(events);

  if (!verification.valid) {
    return {
      tampered: true,
      message: verification.message,
      invalidEventId: verification.invalidEventId,
      checkedEvents: verification.checkedEvents,
    };
  }

  return {
    tampered: false,
    message: "No tampering detected. Audit chain is valid.",
    checkedEvents: verification.checkedEvents,
  };
}