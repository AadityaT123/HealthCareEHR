import express from 'express';

import { getAllPatients, getPatientById, createNewPatient, updatePatient, deletePatient } from '../controllers/patient.controller.js';

const router = express.Router();


router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', createNewPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;