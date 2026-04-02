import express from "express";
import {
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByPatientId,
    createPrescriptionHandler,
    updatePrescription,
    deletePrescription
} from "../controllers/prescription.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Specific routes before parameterized routes
router.get("/patient/:patientId", protect, getPrescriptionsByPatientId);
router.get("/", protect, getAllPrescriptions);
router.get("/:id", protect, getPrescriptionById);
router.post("/", protect, authorize("Admin", "Doctor"), createPrescriptionHandler);
router.put("/:id", protect, authorize("Admin", "Doctor", "Pharmacist"), updatePrescription);
router.delete("/:id", protect, authorize("Admin", "Doctor"), deletePrescription);

export default router;