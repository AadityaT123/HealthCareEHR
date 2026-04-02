const createPrescription = ({ 
    patientId, 
    doctorId, 
    medicationId, 
    prescriptionDate, 
    dosage,
    frequency,
    duration,
    refills, 
    notes 
}) => {
    return {
        id: Date.now().toString(),
        patientId,                  
        doctorId,                   
        medicationId,               
        prescriptionDate,           
        dosage,                     
        frequency,                  
        duration,                       
        refills: refills || 0,
        status: "Active",           
        notes: notes || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createPrescription };