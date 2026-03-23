import express from 'express';
import router from 'express-promise-router';

import { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js';

router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;