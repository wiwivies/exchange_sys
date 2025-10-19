import express from "express";
import {
  getRates,
  addCurrency,
  updateCurrency,
  deleteCurrency,
} from "../controllers/ratesChangeController.js";

const router = express.Router();

router.get("/", getRates);
router.post("/", addCurrency);
router.put("/:id", updateCurrency);
router.delete("/:id", deleteCurrency);

export default router;
