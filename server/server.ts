import express from "express";
import cors from "cors";
import auditRoutes from "./src/routes/auditRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    service: "M5 Audit Trail API",
    status: "running",
  });
});

app.use("/api/audit", auditRoutes);

app.listen(PORT, () => {
  console.log(`M5 Audit API running on port ${PORT}`);
});