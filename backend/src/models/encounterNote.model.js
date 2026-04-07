const createEncounterNote = ({ 
    patientId,
    doctorId,
    appointmentId,
    encounterDate,
    chiefComplaint,
    diagnosis,
    treatmentPlan,
    notes
}) => {
    return {
        id: Date.now().toString(),
        patientId,
        doctorId,
        appointmentId,
        encounterDate,
        chiefComplaint,
        diagnosis,
        treatmentPlan,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createEncounterNote };