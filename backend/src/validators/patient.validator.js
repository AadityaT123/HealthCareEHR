import Joi from "joi";

export const createPatientV = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().iso().required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    contactInformation: Joi.object({
        phone: Joi.string().optional(),
        email: Joi.string().email().optional(),
        address: Joi.string().optional(),
    }).optional(),
    insuranceDetails: Joi.object({
        provider: Joi.string().optional(),
        policyNumber: Joi.string().optional(),
    }).optional(),
});

export const updatePatientV = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dateOfBirth: Joi.date().iso().optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    contactInformation: Joi.object({
        phone: Joi.string().optional(),
        email: Joi.string().email().optional(),
        address: Joi.string().optional(),
    }).optional(),
    insuranceDetails: Joi.object({
        provider: Joi.string().optional(),
        policyNumber: Joi.string().optional(),
    }).optional(),
}).min(1); // At least one field is required for update
