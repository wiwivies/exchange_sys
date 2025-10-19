import express from "express";
import {
  getAdminReport,
  getAdminStats,
} from "../controllers/adminReportController.js";

const router = express.Router();

router.get("/getAdminReport", getAdminReport);
router.get("/getAdminStats", getAdminStats);

export default router;
