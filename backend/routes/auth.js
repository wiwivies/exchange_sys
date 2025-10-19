// backend/routes/auth.js
import express from "express";
import { loginUser } from "../controllers/authController.js";

const router = express.Router();

// ✅ єдиний маршрут для входу
router.post("/login", loginUser);

export default router;
