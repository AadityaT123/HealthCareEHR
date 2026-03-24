const createPatient = ({ firstName, lastName, dateOfBirth, gender, email, phone, address }) => {
    return {
        id: Date.now().toString(),
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        phone,
        address,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createPatient };