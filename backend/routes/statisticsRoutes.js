import express from "express";
import { getShortStatistics } from "../controllers/statisticsController.js";

const router = express.Router();

// Маршрут для короткої статистики
router.get("/short", getShortStatistics);

export default router;
