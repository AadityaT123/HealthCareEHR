import { createMedication } from "../models/medication.model";
import { medications } from "../data/store.data";

const getAllMedications = (req, res) => {
    const { category, name }= req.query;

    let result = medications;
    if(category)
        result = result.filter(m => m.category.toLowerCase() === category.toLowerCase());

    if(name)
        result = result.filter(m => m.medicationName.toLowerCase().includes(name.toLowerCase()));

    res.status(200).json({ success: true, count: result.length, data: result });
};

const getMedicationById = (req, res) => {
    const medication = medications.find(m => m.id === req.params.id);
    if(!medication)
        return res.status(404).json({ success: false, message: "Medication not found" });

    res.status(200).json({ success: true, data: medication });
};

const createMedicationHandler = (req, res) => {
    const { medicationName, dosage, instructions, category, sideEffects, contraindications } = req.body;

    const missing = [];
    if(!medicationName) missing.push("medicationName");
    if(!dosage) missing.push("dosage");
    if(!instructions) missing.push("instructions");
    if(!category) missing.push("category");

    if(missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required field ${missing.joim(", ")}` });
    
    const exists = medications.find(m => m.medicationName.toLowerCase() === medicationName.toLowerCase() && m.dosage.toLowerCase() === dosage.toLowerCase());
    if(exists)
        return res.status(409).json({ success: false, message: "Medication with this name and dosage already exists" });
    
    if(sideEffects && !Array.isArray(sideEffects))
        return res.status(400).json({ success: false, message: "sideEffects must be an array" });
    if(contraindications && !Array.isArray(contraindications))
        return res.status(409).json({ success: false, message: "contraindications must be an array" });

    const medication = createMedication({ medicationName, dosage, instructions, category, sideEffects, contraindications });
    medications.push(medication);

    res.status(201).json({ success: true, data: medication });
};

const updateMedication = (req, res) => {
    const index = medications.findIndex(m => m.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: "Medication not found" });

    if(req.body.sideEffects && !Array(req.body.sideEffects))
        return res.status(400).json({ success: false, message: "sideEffects must be an array" });
    
    if(req.body.contraindications && !Array(req.body.contraindications))
        return res.status(400).json({ success: false, message: "contraindications must be an array" });

    medications[index] = {
        ...medications[index],
        ...req.body,
        id: medications[index].id,
        createdAt: medications[index].createdAt,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json({ success: true, data: medications[index] });
};

const deleteMedication = (req, res) => {
    const index = medications.findIndex(m => m.id === req.params.id);

    if(index === -1)
        return res.status(404).json({ success: false, message: "Medication not found" });

    medications[index].isActive = false;
    medications[index].updatedAt = new Date().toISOString();

    res.status(200).json({ success: true, message: "Medication deactivated successfully"});
};

export default { getAllMedications, getMedicationById, createMedicationHandler, updateMedication, deleteMedication };