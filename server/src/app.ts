import express from "express";
import commandRoutes from "./routes/commandRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.use("/api/commands", commandRoutes);

app.use(errorHandler);

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "CQRS Write Command API is running",
  });
});

export default app;