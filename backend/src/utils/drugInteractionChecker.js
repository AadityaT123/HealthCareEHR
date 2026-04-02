import { medications } from "../data/store.data.js";

const checkDrugInteractions = (newMedicationId, existingMedicationIds) => {
    const interactions = [];

    const newMedication = medications.find(m => m.id === newMedicationId);
    if (!newMedication) return interactions;

    existingMedicationIds.forEach(existingId => {
        const existingMedication = medications.find(m => m.id === existingId);
        if (!existingMedication) return;

        const newContraIndicatesExisting = newMedication.contraindications?.some(c =>
            c.toLowerCase() === existingMedication.medicationName.toLowerCase()
        );

        const existingContraIndicatesNew = existingMedication.contraindications?.some(c =>
            c.toLowerCase() === newMedication.medicationName.toLowerCase()
        );

        if (newContraIndicatesExisting || existingContraIndicatesNew) {
            interactions.push({
                medication1: newMedication.medicationName,
                medication2: existingMedication.medicationName,
                severity: "High",
                message: `Potential interaction between ${newMedication.medicationName} and ${existingMedication.medicationName}`
            });
        }
    });

    return interactions;
};

export { checkDrugInteractions };