import express from 'express';
import { getAllAppointments, getAppointmentById, createAppointmentHandler, updateAppointment, deleteAppointment } from '../controllers/appointment.controller.js';

const router = express.Router();

router.get('/', getAllAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointmentHandler);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;