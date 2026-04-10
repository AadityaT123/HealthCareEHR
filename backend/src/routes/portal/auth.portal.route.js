import express from "express";
import { patientRegister, patientLogin, verifyEmail, getPortalMe } from "../../controllers/portal/auth.portal.controller.js";
import { protectPortal } from "../../middlewares/portalAuth.middleware.js";

const router = express.Router();

router.post("/register", patientRegister);
router.post("/login", patientLogin);
router.get("/verify/:token", verifyEmail);
router.get("/me", protectPortal, getPortalMe);

export default router;
