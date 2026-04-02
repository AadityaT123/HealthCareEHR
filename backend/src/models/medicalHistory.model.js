const createMedicalHistory = ({ patientId, conditionName, diagnosisDate, notes }) => {
    return {
        id: Date.now().toString(),
        patientId,
        conditionName,
        diagnosisDate,
        notes: notes || "",
        createdAt:new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createMedicalHistory };