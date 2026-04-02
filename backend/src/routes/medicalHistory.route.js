import express from "express";
import {
  getAllMedicalHistory,
  getMedicalHistoryById,
  getMedicalHistoryByPatientId,
  createMedicalHistoryHandler,
  updateMedicalHistory,
  deleteMedicalHistory,
} from "../controllers/medicalHistory.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("patient/:patientId", protect, getMedicalHistoryByPatientId);
router.get("/", protect, getAllMedicalHistory);
router.get("/:id", protect, getMedicalHistoryById);
router.post("patient/:patientId", protect, authorize("Admin", "Doctor", "Nurse"), createMedicalHistoryHandler);
router.put("patient/:patientId", protect, authorize("Admin", "Doctor", "Nurse"), updateMedicalHistory);
router.delete("patient/:patientId", protect, authorize("Admin"), deleteMedicalHistory);

export default router;
