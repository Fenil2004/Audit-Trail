import { Router, Request, Response } from "express";
import { authenticateJwt } from "../auth/jwtAuth";
import {
  requirePermission
} from "../middleware/requirePermission";
export const protectedRouter = Router();

// ---------------------------------------------
// GET /api/protected/profile
// Any valid authenticated persona
// ---------------------------------------------

protectedRouter.get(
  "/profile",
  authenticateJwt,
  (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      user: req.user
    });
  }
);

// ---------------------------------------------
// POST /api/protected/dispatch
// Requires DISPATCH permission
// ---------------------------------------------

protectedRouter.post(
  "/dispatch",
  authenticateJwt,
  requirePermission("DISPATCH"),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Dispatch permission verified"
    });
  }
);

// ---------------------------------------------
// POST /api/protected/customs
// Requires CUSTOMS permission
// ---------------------------------------------

protectedRouter.post(
  "/customs",
  authenticateJwt,
  requirePermission("CUSTOMS"),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Customs permission verified"
    });
  }
);

// ---------------------------------------------
// POST /api/protected/telemetry
// Requires RECORD_TELEMETRY permission
// ---------------------------------------------

protectedRouter.post(
  "/telemetry",
  authenticateJwt,
  requirePermission("RECORD_TELEMETRY"),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Telemetry permission verified"
    });
  }
);

// ---------------------------------------------
// GET /api/protected/audit
// Requires VERIFY_AUDIT permission
// ---------------------------------------------

protectedRouter.get(
  "/audit",
  authenticateJwt,
  requirePermission("VERIFY_AUDIT"),
  (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Audit verification permission granted"
    });
  }
);

