const createDoctor = ({ firstName, lastName, specialization, email, phone, licenseNumber  }) => {
    return {
        id: Date.now().toString(),
        firstName,
        lastName,
        specialization,
        email,
        phone,
        licenseNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createDoctor };