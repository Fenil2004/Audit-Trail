import { Router } from "express";
import {
  getAuditEvents,
  verifyAuditEvent,
} from "../services/auditService";

const router = Router();

router.get("/events", (_req, res) => {
  res.json({
    success: true,
    count: getAuditEvents().length,
    events: getAuditEvents(),
  });
});

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