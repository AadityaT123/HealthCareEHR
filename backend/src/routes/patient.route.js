import express from 'express';

import { getAllPatients, getPatientById, createPatientHandler, updatePatient, deletePatient } from '../controllers/patient.controller.js';
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();


router.get('/', protect, getAllPatients);
router.get('/:id', protect, getPatientById);
router.post('/',protect, authorize("Admin", "Receptionist", "Doctor", "Nurse"), createPatientHandler);
router.put('/:id',protect, authorize("Admin", "Receptionist", "Doctor", "Nurse"), updatePatient);
router.delete('/:id',protect, authorize("Admin"), deletePatient);

export default router;