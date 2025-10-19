import express from "express";
import {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser
} from "../controllers/usersAdminController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", addUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
