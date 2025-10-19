import express from "express";
import { getCurrencies, checkClient, makeExchange, getLatestOperations, getExchangeRate } from "../controllers/operationController.js";


const router = express.Router();

router.get("/currencies", getCurrencies);
router.get("/rate", getExchangeRate);
router.get("/check-client/:id", checkClient);
router.post("/exchange", makeExchange);
router.get("/latest", getLatestOperations);

export default router;
