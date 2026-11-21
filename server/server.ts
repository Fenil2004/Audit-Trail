import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import { authenticateToken } from "./src/middleware/authMiddleware.js";
import {
  connectDB,
  isDBConnected,
} from "./src/config/db.js";

import { seedAuditEvents } from "./src/services/auditService.js";
import auditRoutes from "./src/routes/auditRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
const PORT = Number(process.env.PORT) || 5000;

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    server: "running",
    database: isDBConnected() ? "connected" : "disconnected",
  });
});

app.use("/api/audit", authenticateToken, (req, res, next) => {
  if (!isDBConnected()) {
    res.status(503).json({
      success: false,
      message: "Database is currently unavailable. Please retry later.",
    });
    return;
  }

  next();
});

app.use("/api/audit", auditRoutes);

async function connectWithRetry(): Promise<void> {
  while (!isDBConnected()) {
    try {
      await connectDB();
      await seedAuditEvents();

      console.log("Audit events seeded successfully");
    } catch (error) {
      console.error(
        "MongoDB connection failed. Retrying in 10 seconds."
      );

      console.error(
        error instanceof Error ? error.message : error
      );

      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  void connectWithRetry();
});