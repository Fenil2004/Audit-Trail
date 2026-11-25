
import { Router } from "express";
import { authorizeRole } from "../middleware/roleMiddleware.js";
import {
  createAuditEvent,
  getAuditEvents,
  verifyAuditEvent,
} from "../services/auditService.js";

import type { AuditEventType, AuditStatus } from "../types/audit.js";

const router = Router();

const eventTypes: AuditEventType[] = [
  "SHIPMENT_CREATED",
  "SHIPMENT_DISPATCHED",
  "TEMPERATURE_RECORDED",
  "EXCURSION_DETECTED",
  "SHIPMENT_DELIVERED",
];

const statuses: AuditStatus[] = [
  "SUCCESS",
  "FAILED",
  "PENDING",
  "CRITICAL",
];

// GET: Fetch all audit events
router.get("/events", async (_req, res, next) => {
  try {
    const events = await getAuditEvents();

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
});

// POST: Create audit event
router.post("/events", authorizeRole("admin"), async (req, res, next) => {
  try {
    const { shipmentId, eventType, actor, description, status } = req.body;

    if (
      typeof shipmentId !== "string" ||
      !shipmentId.trim() ||
      typeof actor !== "string" ||
      !actor.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !eventTypes.includes(eventType) ||
      !statuses.includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid audit event data",
      });
      return;
    }

    const event = await createAuditEvent({
      shipmentId: shipmentId.trim(),
      eventType,
      actor: actor.trim(),
      description: description.trim(),
      status,
    });

    res.status(201).json({
      success: true,
      message: "Audit event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
});

// GET: Verify audit event
router.get("/verify/:id", async (req, res, next) => {
  try {
    const eventId = req.params.id;

    if (typeof eventId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
      return;
    }
    const result = await verifyAuditEvent(eventId);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Audit event not found",
      });
      return;
    }

    res.json({
      success: true,
      verification: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;