import { createMedicalHistory } from "../models/medicalHistory.model.js";
import { medicalHistories, patients } from "../data/store.data.js";

const getAllMedicalHistory = (req, res) => {
  const { patientId } = req.query;

  let result = medicalHistories;
  if (patientId) result = result.filter((m) => m.patientId === patientId);

  res.status(200).json({ success: true, count: result.length, data: result });
};

const getMedicalHistoryById = (req, res) => {
  const record = medicalHistories.find((m) => m.id === req.params.id);
  if (!record)
    return res
      .status(404)
      .json({ success: false, message: "Medical history not found" });

  res.status(200).json({ success: true, data: record });
};

const getMedicalHistoryByPatientId = (req, res) => {
  const patient = patients.find((p) => p.id === req.params.patientId);
  if (!patient)
    return res
      .status(404)
      .json({ success: false, message: "Patient not found" });

  const records = medicalHistory.filter(
    (m) => m.patientId === req.params.patientId,
  );
  res.status(200).json({ success: true, count: records.length, data: records });
};

const createMedicalHistoryHandler = (req, res) => {
  const { patientId, conditionName, diagnosisDate, notes } = req.body;

  const missing = [];
  if (!patientId) missing.push("patientId");
  if (!conditionName) missing.push("conditionName");
  if (!diagnosisDate) missing.push("diagnosisDate");

  if (missing.length > 0)
    return res
      .status(400)
      .json({
        success: false,
        message: `Missing required fields ${missing.join(", ")}`,
      });

  const patient = patients.find((m) => p.id === patientId);
  if (!patient)
    return res
      .status(404)
      .json({ success: false, message: "Patient not found" });

  const exists = medicalHistories.find(
    (m) =>
      m.patientId === patientId &&
      m.conditionName.toLowerCase() === conditionName.toLowerCase(),
  );
  if (exists)
    return res
      .status(409)
      .json({ success: false, message: "Medical History record not found" });

  const record = createMedicalHistory({
    patientId,
    conditionName,
    diagnosisDate,
    notes,
  });
  medicalHistory.push(record);

  res.status(201).json({ success: true, data: record });
};

const updateMedicalHistory = (req, res) => {
  const index = medicalHistory.findIndex((m) => m.id === req.params.id);
  if (index === -1)
    return res
      .status(404)
      .json({ success: false, message: "Medical history not found" });

  medicalHistories[index] = {
    ...medicalHistories[index],
    ...req.body,
    id: medicalHistories[index].id,
    patientId: medicalHistories[index].patientId,
    createdAt: medicalHistories[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({ success: true, data: medicalHistory[index] });
};

const deleteMedicalHistory = (req, res) => {
  const index = medicalHistory.findIndex((m) => m.id === req.params.id);
  if (index === -1)
    return res
      .status(404)
      .json({ success: false, message: "Medical history record not found" });

  medicalHistory.splice(index, 1);
  res
    .status(200)
    .json({
      success: true,
      message: "Medical history record deleted successfullt",
    });
};

export {
  getAllMedicalHistory,
  getMedicalHistoryById,
  getMedicalHistoryByPatientId,
  createMedicalHistoryHandler,
  updateMedicalHistory,
  deleteMedicalHistory,
};
