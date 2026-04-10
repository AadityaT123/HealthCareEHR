import Joi from "joi";

export const createDoctorV = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    specialization: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    licenseNumber: Joi.string().required()
});

export const updateDoctorV = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    specialization: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    licenseNumber: Joi.string().optional(),
    isActive: Joi.boolean().optional()
}).min(1);
