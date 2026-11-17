import { Router } from "express";

import {
  getAuditEvents,
  verifyAuditEvent,
} from "../services/auditService.js";

const router = Router();

// Get all audit events
router.get("/events", (_req, res) => {
  const events = getAuditEvents();

  res.json({
    success: true,
    count: events.length,
    events,
  });
});

// Find and inspect one audit event
router.get("/verify/:id", (req, res) => {
  const result = verifyAuditEvent(req.params.id);

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
});

export default router;