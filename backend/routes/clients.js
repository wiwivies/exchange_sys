import express from "express";
import { getClients, addClient } from "../controllers/clientController.js";

const router = express.Router();

router.get("/", getClients);
router.post("/", addClient);

export default router;
