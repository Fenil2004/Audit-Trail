import express from "express";
import cors from "cors";
import "dotenv/config";

import { authRouter } from "./auth/authRoutes";

import {
  protectedRouter
} from "./routes/protectedRoutes";

const app = express();

const PORT = Number(
  process.env.PORT || 5000
);

// ---------------------------------------------
// Middleware
// ---------------------------------------------

app.use(cors());

app.use(express.json());

// ---------------------------------------------
// Health check
// ---------------------------------------------

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    service: "M5 JWT Authentication Engine",
    status: "running"
  });
});

// ---------------------------------------------
// Routes
// ---------------------------------------------

app.use("/api/auth", authRouter);

app.use("/api/protected", protectedRouter);

// ---------------------------------------------
// 404 handler
// ---------------------------------------------

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ---------------------------------------------
// Start server
// ---------------------------------------------

app.listen(PORT, () => {
  console.log(
    `M5 Authentication Engine running on port ${PORT}`
  );
});
