import Joi from "joi";

export const createEncounterNoteSchema = Joi.object({
    patientId: Joi.number().integer().required(),
    doctorId: Joi.number().integer().required(),
    appointmentId: Joi.number().integer().required(),
    encounterDate: Joi.date().iso().required(),
    chiefComplaint: Joi.string().trim().min(5).required(),
    diagnosis: Joi.string().trim().min(2).required(),
    treatmentPlan: Joi.string().trim().min(5).required(),
    notes: Joi.string().trim().optional().allow(""),
});

export const updateEncounterNoteSchema = Joi.object({
    encounterDate: Joi.date().iso().optional(),
    chiefComplaint: Joi.string().trim().min(5).optional(),
    diagnosis: Joi.string().trim().min(2).optional(),
    treatmentPlan: Joi.string().trim().min(5).optional(),
    notes: Joi.string().trim().optional().allow(""),
}).min(1); // Ensure at least one field is provided for update
