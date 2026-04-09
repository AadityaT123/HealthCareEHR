import express from 'express';
import { getAllDoctors, getDoctorById, createDoctorHandler, updateDoctor, deleteDoctor, deactivateDoctor } from '../controllers/doctor.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get("/", protect, getAllDoctors);
router.get("/:id", protect, getDoctorById);
router.post("/", protect, authorize("Admin"), createDoctorHandler);
router.put("/:id", protect, authorize("Admin"), updateDoctor);
router.patch("/:id/deactivate", protect, authorize("Admin"), deactivateDoctor);
router.delete("/:id", protect, authorize("Admin"), deleteDoctor);

export default router;