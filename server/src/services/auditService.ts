import { mockEvents } from "../data/mockEvents.js";

export function getAuditEvents() {
  return mockEvents;
}

export function verifyAuditEvent(id: string) {
  const event = mockEvents.find(
    (item) => item.eventId === id
  );

  if (!event) {
    return null;
  }

  return {
    eventId: event.eventId,
    shipmentId: event.shipmentId,
    verificationStatus: "NOT_VERIFIED",
    message: "Cryptographic verification is not implemented yet.",
  };
}