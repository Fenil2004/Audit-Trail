import { Router } from "express";
import { authorizeRole } from "../middleware/roleMiddleware.js";

import {
  createShipment,
  getAllShipments,
  getShipmentById,
  updateShipmentStatus,
} from "../services/shipmentService.js";

import type { ShipmentStatus } from "../models/Shipment.js";

const router = Router();

const validStatuses: ShipmentStatus[] = [
  "CREATED",
  "IN_TRANSIT",
  "DELIVERED",
];

// GET: All shipments
router.get("/", async (_req, res, next) => {
  try {
    const shipments = await getAllShipments();

    res.json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    next(error);
  }
});

// GET: Shipment details
router.get("/:id", async (req, res, next) => {
  try {
    const shipmentId = req.params.id;

    if (typeof shipmentId !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid shipment ID",
      });
      return;
    }

    const shipment = await getShipmentById(shipmentId);

    if (!shipment) {
      res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
      return;
    }

    res.json({
      success: true,
      shipment,
    });
  } catch (error) {
    next(error);
  }
});

// POST: Create shipment - Admin only
router.post("/", authorizeRole("admin"), async (req, res, next) => {
  try {
    const {
      title,
      origin,
      destination,
      expectedDelivery,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof origin !== "string" ||
      !origin.trim() ||
      typeof destination !== "string" ||
      !destination.trim() ||
      typeof expectedDelivery !== "string" ||
      !expectedDelivery.trim() ||
      Number.isNaN(Date.parse(expectedDelivery))
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide valid shipment details",
      });
      return;
    }

    const shipment = await createShipment(
      {
        title,
        origin,
        destination,
        expectedDelivery,
      },
      req.user!.email,
    );

    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      shipment,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH: Update shipment status - Admin only
router.patch(
  "/:id/status",
  authorizeRole("admin"),
  async (req, res, next) => {
    try {
      const shipmentId = req.params.id;
      const { status } = req.body;

      if (
        typeof shipmentId !== "string" ||
        !validStatuses.includes(status)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid shipment ID or status",
        });
        return;
      }

      const shipment = await updateShipmentStatus(
        shipmentId,
        status,
        req.user!.email,
      );

      if (!shipment) {
        res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Shipment status updated successfully",
        shipment,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Shipment already has this status"
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      next(error);
    }
  },
);

export default router;