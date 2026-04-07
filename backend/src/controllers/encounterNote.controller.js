import { createEncounterNote } from "../models/encounterNote.model.js";
import { encounterNotes, patients, doctors, appointments } from "../data/store.data.js";

// GET /api/encounters
const getAllEncounterNotes = (req, res) => {
    const { patientId, doctorId, appointmentId } = req.query;

    let result = encounterNotes;
    if (patientId) result = result.filter(e => e.patientId === patientId);
    if (doctorId) result = result.filter(e => e.doctorId === doctorId);
    if (appointmentId) result = result.filter(e => e.appointmentId === appointmentId);

    res.status(200).json({ success: true, count: result.length, data: result });
};

// GET /api/encounters/:id
const getEncounterNoteById = (req, res) => {
    const note = encounterNotes.find(e => e.id === req.params.id);
    if (!note)
        return res.status(404).json({ success: false, message: "Encounter note not found" });

    res.status(200).json({ success: true, data: note });
};

// GET /api/encounters/patient/:patientId
const getEncounterNotesByPatientId = (req, res) => {
    const patient = patients.find(p => p.id === req.params.patientId);
    if (!patient)
        return res.status(404).json({ success: false, message: "Patient not found" });

    const result = encounterNotes.filter(e => e.patientId === req.params.patientId);
    res.status(200).json({ success: true, count: result.length, data: result });
};

// GET /api/encounters/doctor/:doctorId
const getEncounterNotesByDoctorId = (req, res) => {
    const doctor = doctors.find(d => d.id === req.params.doctorId);
    if (!doctor)
        return res.status(404).json({ success: false, message: "Doctor not found" });

    const result = encounterNotes.filter(e => e.doctorId === req.params.doctorId);
    res.status(200).json({ success: true, count: result.length, data: result });
};

// POST /api/encounters
const createEncounterNoteHandler = (req, res) => {
    const { patientId, doctorId, appointmentId, encounterDate, chiefComplaint, diagnosis, treatmentPlan, notes } = req.body;

    // Required field validation
    const missing = [];
    if (!patientId) missing.push("patientId");
    if (!doctorId) missing.push("doctorId");
    if (!appointmentId) missing.push("appointmentId");
    if (!encounterDate) missing.push("encounterDate");
    if (!chiefComplaint) missing.push("chiefComplaint");
    if (!diagnosis) missing.push("diagnosis");
    if (!treatmentPlan) missing.push("treatmentPlan");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    // Validate patient exists
    const patient = patients.find(p => p.id === patientId);
    if (!patient)
        return res.status(404).json({ success: false, message: "Patient not found" });

    // Validate doctor exists
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor)
        return res.status(404).json({ success: false, message: "Doctor not found" });

    // Validate appointment exists
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment)
        return res.status(404).json({ success: false, message: "Appointment not found" });

    // Validate appointment belongs to same patient and doctor
    if (appointment.patientId !== patientId)
        return res.status(400).json({ success: false, message: "Appointment does not belong to this patient" });
    if (appointment.doctorId !== doctorId)
        return res.status(400).json({ success: false, message: "Appointment does not belong to this doctor" });

    // Prevent duplicate encounter note for same appointment
    const exists = encounterNotes.find(e => e.appointmentId === appointmentId);
    if (exists)
        return res.status(409).json({ success: false, message: "An encounter note already exists for this appointment" });

    const note = createEncounterNote({ patientId, doctorId, appointmentId, encounterDate, chiefComplaint, diagnosis, treatmentPlan, notes });
    encounterNotes.push(note);

    // Update appointment status to Completed
    const appointmentIndex = appointments.findIndex(a => a.id === appointmentId);
    if (appointmentIndex !== -1) {
        appointments[appointmentIndex].status = "Completed";
        appointments[appointmentIndex].updatedAt = new Date().toISOString();
    }

    res.status(201).json({ success: true, data: note });
};

// PUT /api/encounters/:id
const updateEncounterNote = (req, res) => {
    const index = encounterNotes.findIndex(e => e.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Encounter note not found" });

    encounterNotes[index] = {
        ...encounterNotes[index],
        ...req.body,
        id: encounterNotes[index].id,
        patientId: encounterNotes[index].patientId,     // prevent FK override
        doctorId: encounterNotes[index].doctorId,      // prevent FK override
        appointmentId: encounterNotes[index].appointmentId, // prevent FK override
        createdAt: encounterNotes[index].createdAt,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json({ success: true, data: encounterNotes[index] });
};

// DELETE /api/encounters/:id
const deleteEncounterNote = (req, res) => {
    const index = encounterNotes.findIndex(e => e.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Encounter note not found" });

    encounterNotes.splice(index, 1);
    res.status(200).json({ success: true, message: "Encounter note deleted successfully" });
};

export {
    getAllEncounterNotes,
    getEncounterNoteById,
    getEncounterNotesByPatientId,
    getEncounterNotesByDoctorId,
    createEncounterNoteHandler,
    updateEncounterNote,
    deleteEncounterNote
};

// First commit sample
//second commit sample
//third commit sample
//fourth commit sample
//fifth commit sample