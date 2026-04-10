import Joi from "joi";

export const createAppointmentV = Joi.object({
    patientId: Joi.number().integer().required(),
    doctorId: Joi.number().integer().required(),
    appointmentDate: Joi.date().iso().required(),
    appointmentType: Joi.string().valid('Consultation', 'Follow-up', 'Surgery', 'Emergency').required(),
    reason: Joi.string().required(),
});

export const updateAppointmentV = Joi.object({
    patientId: Joi.number().integer().optional(),
    doctorId: Joi.number().integer().optional(),
    appointmentDate: Joi.date().iso().optional(),
    appointmentType: Joi.string().valid('Consultation', 'Follow-up', 'Surgery', 'Emergency').optional(),
    reason: Joi.string().optional(),
    status: Joi.string().valid('Scheduled', 'Completed', 'Cancelled', 'No Show').optional(),
}).min(1);
