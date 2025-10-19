import express from "express";
import {
  getAllClients,
  getClientOperations,
  updateClient,
  deleteClient,
} from "../controllers/clientsAdminController.js";

const router = express.Router();

// Усі клієнти
router.get("/", getAllClients);

// Операції конкретного клієнта
router.get("/:id/operations", getClientOperations);

// Оновлення клієнта
router.put("/:id", updateClient);

// Видалення клієнта
router.delete("/:id", deleteClient);

export default router;
