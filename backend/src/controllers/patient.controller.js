import { Op } from "sequelize";
import { Patient } from "../models/index.js";
import { logAction } from "../utils/auditLogger.js";

// GET /api/patients
const getAllPatients = async (req, res) => {
    const { gender, name } = req.query;

    try {
        const where = {};
        if (gender) where.gender = gender;
        if (name) {
            where[Op.or] = [
                { firstName: { [Op.iLike]: `%${name}%` } },
                { lastName:  { [Op.iLike]: `%${name}%` } }
            ];
        }

        const patients = await Patient.findAll({ where });
        return res.status(200).json({ success: true, count: patients.length, data: patients });
    } catch (err) {
        console.error("getAllPatients error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/patients/:id
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient)
            return res.status(404).json({ success: false, message: `Patient with ID ${req.params.id} not found` });

        return res.status(200).json({ success: true, data: patient });
    } catch (err) {
        console.error("getPatientById error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/patients
const createPatientHandler = async (req, res) => {
    const { firstName, lastName, dateOfBirth, gender, contactInformation, insuranceDetails } = req.body;

    const missing = [];
    if (!firstName)  missing.push("firstName");
    if (!lastName)   missing.push("lastName");
    if (!dateOfBirth) missing.push("dateOfBirth");
    if (!gender)     missing.push("gender");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    if (!contactInformation?.email || !contactInformation?.phone)
        return res.status(400).json({ success: false, message: "contactInformation must include email and phone" });

    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender))
        return res.status(400).json({ success: false, message: `Invalid gender. Must be one of: ${validGenders.join(", ")}` });

    try {
        // Check email uniqueness across all patients (JSONB field)
        const existing = await Patient.findOne({
            where: { contactInformation: { email: contactInformation.email } }
        });
        if (existing)
            return res.status(409).json({ success: false, message: "Email already exists" });

        const patient = await Patient.create({
            firstName, lastName, dateOfBirth, gender,
            contactInformation: {
                email:   contactInformation.email   || "",
                phone:   contactInformation.phone   || "",
                address: contactInformation.address || ""
            },
            insuranceDetails: {
                provider:     insuranceDetails?.provider     || "",
                policyNumber: insuranceDetails?.policyNumber || "",
                groupNumber:  insuranceDetails?.groupNumber  || ""
            }
        });

        await logAction({
            userId: req.user ? req.user.id : null,
            action: "CREATE",
            resource: "Patient",
            resourceId: patient.id,
            details: { name: `${firstName} ${lastName}` },
            ipAddress: req.ip
        });

        return res.status(201).json({ success: true, message: "Patient created successfully", data: patient });
    } catch (err) {
        console.error("createPatient error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/patients/:id
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient)
            return res.status(404).json({ success: false, message: `Patient with ID ${req.params.id} not found` });

        // Check email conflict on update
        if (req.body.contactInformation?.email) {
            const conflict = await Patient.findOne({
                where: {
                    contactInformation: { email: req.body.contactInformation.email },
                    id: { [Op.ne]: req.params.id }
                }
            });
            if (conflict)
                return res.status(409).json({ success: false, message: "Email already exists" });
        }

        const { firstName, lastName, dateOfBirth, gender, contactInformation, insuranceDetails } = req.body;

        await patient.update({
            ...(firstName  && { firstName }),
            ...(lastName   && { lastName }),
            ...(dateOfBirth && { dateOfBirth }),
            ...(gender     && { gender }),
            ...(contactInformation && {
                contactInformation: { ...patient.contactInformation, ...contactInformation }
            }),
            ...(insuranceDetails && {
                insuranceDetails: { ...patient.insuranceDetails, ...insuranceDetails }
            })
        });

        await logAction({
            userId: req.user ? req.user.id : null,
            action: "UPDATE",
            resource: "Patient",
            resourceId: patient.id,
            details: { updatedFields: Object.keys(req.body) },
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, message: "Patient updated successfully", data: patient });
    } catch (err) {
        console.error("updatePatient error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE /api/patients/:id
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient)
            return res.status(404).json({ success: false, message: `Patient with ID ${req.params.id} not found` });

        await patient.destroy();

        await logAction({
            userId: req.user ? req.user.id : null,
            action: "DELETE",
            resource: "Patient",
            resourceId: patient.id,
            details: { name: `${patient.firstName} ${patient.lastName}` },
            ipAddress: req.ip
        });

        return res.status(200).json({ success: true, message: "Patient deleted successfully" });
    } catch (err) {
        console.error("deletePatient error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getAllPatients, getPatientById, createPatientHandler, updatePatient, deletePatient };
