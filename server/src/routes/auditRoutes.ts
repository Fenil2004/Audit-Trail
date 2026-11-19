
import { Router } from "express";

import {
  createAuditEvent,
  deleteAuditEvent,
  getAuditEvents,
  updateAuditEvent,
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
router.post("/events", async (req, res, next) => {
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

// PUT: Update audit event
router.put("/events/:id", async (req, res, next) => {
  try {
    const { actor, description, status } = req.body;

    const updates: {
      actor?: string;
      description?: string;
      status?: AuditStatus;
    } = {};

    if (actor !== undefined) {
      if (typeof actor !== "string" || !actor.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid actor",
        });
        return;
      }
      updates.actor = actor.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid description",
        });
        return;
      }
      updates.description = description.trim();
    }

    if (status !== undefined) {
      if (!statuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: "Invalid status",
        });
        return;
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one valid field is required",
      });
      return;
    }

    const event = await updateAuditEvent(req.params.id, updates);

    if (!event) {
      res.status(404).json({
        success: false,
        message: "Audit event not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Audit event updated successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Remove audit event
router.delete("/events/:id", async (req, res, next) => {
  try {
    const deleted = await deleteAuditEvent(req.params.id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Audit event not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Audit event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET: Verify audit event
router.get("/verify/:id", async (req, res, next) => {
  try {
    const result = await verifyAuditEvent(req.params.id);

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
