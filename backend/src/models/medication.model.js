const createMedication = ({ medicationName, dosage, instructions, category, sideEffects, contraindications }) => {
    return {
        id: Date.now().toString(),
        medicationName,
        dosage,
        instructions,
        category,
        sideEffects: sideEffects || [],
        contraindications: contraindications || [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

export { createMedication };