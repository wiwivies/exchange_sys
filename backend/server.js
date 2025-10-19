import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import operationsRoutes from "./routes/operations.js";
import ratesRoutes from "./routes/rates.js";
import reportRoutes from "./routes/reports.js";
import clientsRoutes from "./routes/clients.js";

import statisticsRoutes from "./routes/statisticsRoutes.js";
import ratesChangeRoutes from "./routes/ratesChange.js";
import adminReportRoutes from "./routes/adminReportRoutes.js";
import clientsAdminRoutes from "./routes/clientsAdminRoutes.js";
import usersAdminRoutes from "./routes/usersAdminRoutes.js";


import { poolPromise } from "./db/connection.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

console.log("✅ Middleware initialized");

// підключаємо маршрут
app.use("/api", authRoutes);
console.log("✅ Auth routes connected");
app.use("/api/operations", operationsRoutes);
console.log("✅ Routes connected");
app.use("/api/rates", ratesRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/clients", clientsRoutes);

app.use("/api/statistics", statisticsRoutes);
app.use("/api/ratesChange", ratesChangeRoutes);
app.use("/api/admin", adminReportRoutes);
app.use("/api/clientsAdmin", clientsAdminRoutes);
app.use("/api/usersAdmin", usersAdminRoutes);

app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
