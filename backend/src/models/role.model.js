const createRole = ({ roleName, description }) => {
    return {
        id: Date.now().toString(),
        roleName,   // Admin, Doctor, Nurse, Pharmacist, Lab Technician, Receptionist
        description: description || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createRole };  