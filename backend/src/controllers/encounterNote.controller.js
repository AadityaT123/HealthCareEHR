import { EncounterNote, Patient, Doctor, Appointment } from "../models/index.js";

// GET /api/encounters
const getAllEncounterNotes = async (req, res) => {
    const { patientId, doctorId, appointmentId } = req.query;

    let result = encounterNotes;
    if (patientId) result = result.filter(e => e.patientId === patientId);
    if (doctorId) result = result.filter(e => e.doctorId === doctorId);
    if (appointmentId) result = result.filter(e => e.appointmentId === appointmentId);

    res.status(200).json({ success: true, count: result.length, data: result });
};

// GET /api/encounters/:id
const getEncounterNoteById = async (req, res) => {
    try {
        const note = await EncounterNote.findByPk(req.params.id, {
            include: [
                { model: Patient, attributes: ["id", "firstName", "lastName"] },
                { model: Doctor, attributes: ["id", "firstName", "lastName", "specialization"] },
                { model: Appointment, attributes: ["id", "appointmentDate", "appointmentType"] }
            ]
        });
        if (!note)
            return res.status(404).json({ success: false, message: "Encounter note not found" });

        return res.status(200).json({ success: true, data: note });
    } catch (err) {
        console.error("getEncounterNoteById error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/encounters/patient/:patientId
const getEncounterNotesByPatientId = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.patientId);
        if (!patient)
            return res.status(404).json({ success: false, message: "Patient not found" });

        const notes = await EncounterNote.findAll({
            where: { patientId: req.params.patientId },
            include: [{ model: Doctor, attributes: ["id", "firstName", "lastName"] }],
            order: [["encounterDate", "DESC"]]
        });
        return res.status(200).json({ success: true, count: notes.length, data: notes });
    } catch (err) {
        console.error("getEncounterNotesByPatientId error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/encounters/doctor/:doctorId
const getEncounterNotesByDoctorId = async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.doctorId);
        if (!doctor)
            return res.status(404).json({ success: false, message: "Doctor not found" });

        const notes = await EncounterNote.findAll({
            where: { doctorId: req.params.doctorId },
            include: [{ model: Patient, attributes: ["id", "firstName", "lastName"] }],
            order: [["encounterDate", "DESC"]]
        });
        return res.status(200).json({ success: true, count: notes.length, data: notes });
    } catch (err) {
        console.error("getEncounterNotesByDoctorId error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/encounters
const createEncounterNoteHandler = async (req, res) => {
    const { patientId, doctorId, appointmentId, encounterDate, chiefComplaint, diagnosis, treatmentPlan, notes } = req.body;

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

    try {
        const patient = await Patient.findByPk(patientId);
        if (!patient)
            return res.status(404).json({ success: false, message: "Patient not found" });

        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor)
            return res.status(404).json({ success: false, message: "Doctor not found" });

        const appointment = await Appointment.findByPk(appointmentId);
        if (!appointment)
            return res.status(404).json({ success: false, message: "Appointment not found" });

        if (appointment.patientId !== parseInt(patientId))
            return res.status(400).json({ success: false, message: "Appointment does not belong to this patient" });

        if (appointment.doctorId !== parseInt(doctorId))
            return res.status(400).json({ success: false, message: "Appointment does not belong to this doctor" });

        // Prevent duplicate encounter note per appointment (unique constraint in DB)
        const exists = await EncounterNote.findOne({ where: { appointmentId } });
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
    const updateEncounterNote = async (req, res) => {
        try {
            const note = await EncounterNote.findByPk(req.params.id);
            if (!note)
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
        const deleteEncounterNote = async (req, res) => {
            try {
                const note = await EncounterNote.findByPk(req.params.id);
                if (!note)
                    return res.status(404).json({ success: false, message: "Encounter note not found" });

                await note.destroy();
                return res.status(200).json({ success: true, message: "Encounter note deleted successfully" });
            } catch (err) {
                console.error("deleteEncounterNote error:", err);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
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