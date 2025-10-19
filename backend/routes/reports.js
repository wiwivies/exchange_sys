import express from "express";
import { getCashierReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/getCashierReport", getCashierReport);

export default router;
