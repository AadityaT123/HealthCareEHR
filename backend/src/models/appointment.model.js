const createAppointment = ({ patientId, doctorId, date, time, type, status, notes }) => {
    return {
        id: Date.now().toString(),
        patientId,
        doctorId,
        date,
        time,
        type,
        status,
        notes: notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createAppointment };