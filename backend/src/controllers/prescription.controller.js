import { createPrescription } from "../models/prescription.model.js";
import { prescriptions, patients, doctors, medications } from "../data/store.data.js";
import { checkDrugInteractions } from "../utils/drugInteractionChecker.js";

const VALID_STATUSES = ["Active", "Completed", "Cancelled"];

// GET /api/prescriptions
const getAllPrescriptions = (req, res) => {
    const { patientId, doctorId, status } = req.query;

    let result = prescriptions;
    if (patientId) result = result.filter(p => p.patientId === patientId);
    if (doctorId)  result = result.filter(p => p.doctorId === doctorId);
    if (status)    result = result.filter(p => p.status.toLowerCase() === status.toLowerCase());

    res.status(200).json({ success: true, count: result.length, data: result });
};

// GET /api/prescriptions/:id
const getPrescriptionById = (req, res) => {
    const prescription = prescriptions.find(p => p.id === req.params.id);
    if (!prescription)
        return res.status(404).json({ success: false, message: "Prescription not found" });

    res.status(200).json({ success: true, data: prescription });
};

// GET /api/prescriptions/patient/:patientId
const getPrescriptionsByPatientId = (req, res) => {
    const patient = patients.find(p => p.id === req.params.patientId);
    if (!patient)
        return res.status(404).json({ success: false, message: "Patient not found" });

    const result = prescriptions.filter(p => p.patientId === req.params.patientId);
    res.status(200).json({ success: true, count: result.length, data: result });
};

// POST /api/prescriptions
const createPrescriptionHandler = (req, res) => {
    const { patientId, doctorId, medicationId, prescriptionDate, dosage, frequency, duration, refills, notes } = req.body;

    // Required field validation
    const missing = [];
    if (!patientId)        missing.push("patientId");
    if (!doctorId)         missing.push("doctorId");
    if (!medicationId)     missing.push("medicationId");
    if (!prescriptionDate) missing.push("prescriptionDate");
    if (!dosage)           missing.push("dosage");
    if (!frequency)        missing.push("frequency");
    if (!duration)         missing.push("duration");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    // Validate patient exists
    const patient = patients.find(p => p.id === patientId);
    if (!patient)
        return res.status(404).json({ success: false, message: "Patient not found" });

    // Validate doctor exists and is active
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor)
        return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!doctor.isActive)
        return res.status(400).json({ success: false, message: "Doctor is not active" });

    // Validate medication exists and is active
    const medication = medications.find(m => m.id === medicationId);
    if (!medication)
        return res.status(404).json({ success: false, message: "Medication not found" });
    if (!medication.isActive)
        return res.status(400).json({ success: false, message: "Medication is not active" });

    // Drug interaction check
    const activePrescriptions = prescriptions.filter(p =>
        p.patientId === patientId && p.status === "Active"
    );
    const activeMedicationIds = activePrescriptions.map(p => p.medicationId);
    const interactions = checkDrugInteractions(medicationId, activeMedicationIds);

    if (interactions.length > 0)
        return res.status(409).json({
            success: false,
            message: "Drug interaction detected",
            interactions
        });

    const prescription = createPrescription({ patientId, doctorId, medicationId, prescriptionDate, dosage, frequency, duration, refills, notes });
    prescriptions.push(prescription);

    res.status(201).json({ success: true, data: prescription });
};

// PUT /api/prescriptions/:id
const updatePrescription = (req, res) => {
    const index = prescriptions.findIndex(p => p.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Prescription not found" });

    if (req.body.status && !VALID_STATUSES.includes(req.body.status))
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });

    prescriptions[index] = {
        ...prescriptions[index],
        ...req.body,
        id:           prescriptions[index].id,
        patientId:    prescriptions[index].patientId,    // prevent FK override
        doctorId:     prescriptions[index].doctorId,     // prevent FK override
        medicationId: prescriptions[index].medicationId, // prevent FK override
        createdAt:    prescriptions[index].createdAt,
        updatedAt:    new Date().toISOString()
    };

    res.status(200).json({ success: true, data: prescriptions[index] });
};

// DELETE /api/prescriptions/:id  (soft delete — sets status to Cancelled)
const deletePrescription = (req, res) => {
    const index = prescriptions.findIndex(p => p.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Prescription not found" });

    prescriptions[index].status    = "Cancelled";
    prescriptions[index].updatedAt = new Date().toISOString();

    res.status(200).json({ success: true, message: "Prescription cancelled successfully" });
};

export {
    getAllPrescriptions,
    getPrescriptionById,
    getPrescriptionsByPatientId,
    createPrescriptionHandler,
    updatePrescription,
    deletePrescription
};