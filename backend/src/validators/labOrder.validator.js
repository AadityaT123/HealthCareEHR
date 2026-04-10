import Joi from "joi";

export const createLabOrderV = Joi.object({
    patientId: Joi.number().integer().required(),
    doctorId: Joi.number().integer().required(),
    testType: Joi.string().valid("Blood Test", "Urine Test", "X-Ray", "MRI", "CT Scan", "Ultrasound", "ECG", "Biopsy").required(),
    orderDate: Joi.date().iso().required(),
    priority: Joi.string().valid("Routine", "Urgent", "STAT").optional(),
    notes: Joi.string().allow('', null).optional()
});

export const updateLabOrderV = Joi.object({
    status: Joi.string().valid("Pending", "Completed", "Cancelled").required()
});
