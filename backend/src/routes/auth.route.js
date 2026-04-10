import express from "express";
import { register, login, getMe, deactivateUser } from "../controllers/auth.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", protect, authorize("Admin"), register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/deactivate/:id", protect, authorize("Admin"), deactivateUser);

export default router;