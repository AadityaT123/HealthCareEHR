import express from "express";
import {
    getAllAppointments,
    getAppointmentById,
    getAppointmentByPatientId,
    getAppointmentByDoctorId,
    createAppointmentHandler,
    updateAppointment,
    deleteAppointment
} from "../controllers/appointment.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Specific sub-routes BEFORE parameterized /:id
router.get("/patient/:patientId", protect, getAppointmentByPatientId);
router.get("/doctor/:doctorId",   protect, getAppointmentByDoctorId);
router.get("/",                   protect, getAllAppointments);
router.get("/:id",                protect, getAppointmentById);

router.post("/",   protect, authorize("Admin", "Receptionist", "Doctor", "Nurse"), createAppointmentHandler);
router.put("/:id", protect, authorize("Admin", "Receptionist", "Doctor", "Nurse"), updateAppointment);
router.delete("/:id", protect, authorize("Admin", "Receptionist"),                 deleteAppointment);

export default router;