const createLabOrder = ({ 
    patientId, 
    doctorId, 
    testType, 
    orderDate, 
    priority,
    notes 
}) => {
    return {
        id: Date.now().toString(),
        patientId,                  // FK → patients
        doctorId,                   // FK → doctors
        testType,                   // e.g. "Blood Test", "Urine Test", "X-Ray", "MRI", "CT Scan"
        orderDate,                  // e.g. "2026-04-01"
        priority: priority || "Routine",  // "Routine", "Urgent", "STAT"
        status: "Pending",          // "Pending", "In Progress", "Completed", "Cancelled"
        notes: notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createLabOrder };