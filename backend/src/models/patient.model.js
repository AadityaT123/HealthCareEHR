const createPatient = ({ firstName, lastName, dateOfBirth, gender, contactInformation, insuranceDetails }) => {
    return {
        id: Date.now().toString(),
        firstName,
        lastName,
        dateOfBirth,
        gender,
        contactInformation: {
            email: contactInformation?.email || "",
            phone: contactInformation?.phone || "",
            address: contactInformation?.address || ""
        },
        insuranceDetails: {
            provider: insuranceDetails?.provider || "",
            policyNumber: insuranceDetails?.policyNumber || "",
            groupNumber: insuranceDetails?.groupNumber || ""
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createPatient };