import Joi from "joi";

export const createImagingOrderV = Joi.object({
    patientId: Joi.number().integer().required(),
    doctorId: Joi.number().integer().required(),
    encounterId: Joi.number().integer().optional(),
    imagingType: Joi.string().valid("X-Ray", "MRI", "CT Scan", "Ultrasound", "PET Scan", "Mammography").required(),
    bodyPart: Joi.string().required(),
    priority: Joi.string().valid("Routine", "Urgent", "STAT").optional(),
    clinicalReason: Joi.string().allow('', null).optional(),
    scheduledAt: Joi.date().iso().optional()
});

export const updateImagingOrderV = Joi.object({
    status: Joi.string().valid("Pending", "Scheduled", "Completed", "Cancelled").optional(),
    resultUrl: Joi.string().uri().optional(),
    scheduledAt: Joi.date().iso().optional()
}).min(1);
