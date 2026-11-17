import express from "express";
import cors from "cors";
import auditRoutes from "./src/routes/auditRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/audit", auditRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});