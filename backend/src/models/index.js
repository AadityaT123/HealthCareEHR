import Role           from "./Role.js";
import User           from "./User.js";
import Patient        from "./Patient.js";
import Doctor         from "./Doctor.js";
import Medication     from "./Medication.js";
import MedicalHistory from "./MedicalHistory.js";
import Appointment    from "./Appointment.js";
import EncounterNote  from "./EncounterNote.js";
import Prescription   from "./Prescription.js";
import LabOrder       from "./LabOrder.js";
import LabResult      from "./LabResult.js";

// Role → Users
Role.hasMany(User,    { foreignKey: "roleId", onDelete: "RESTRICT" });
User.belongsTo(Role,  { foreignKey: "roleId" });

// Patient associations
Patient.hasMany(MedicalHistory, { foreignKey: "patientId", onDelete: "CASCADE" });
Patient.hasMany(Appointment,    { foreignKey: "patientId", onDelete: "CASCADE" });
Patient.hasMany(Prescription,   { foreignKey: "patientId", onDelete: "CASCADE" });
Patient.hasMany(LabOrder,       { foreignKey: "patientId", onDelete: "CASCADE" });
Patient.hasMany(EncounterNote,  { foreignKey: "patientId", onDelete: "CASCADE" });

MedicalHistory.belongsTo(Patient, { foreignKey: "patientId" });
Appointment.belongsTo(Patient,    { foreignKey: "patientId" });
Prescription.belongsTo(Patient,   { foreignKey: "patientId" });
LabOrder.belongsTo(Patient,       { foreignKey: "patientId" });
EncounterNote.belongsTo(Patient,  { foreignKey: "patientId" });

// Doctor associations
Doctor.hasMany(Appointment,   { foreignKey: "doctorId", onDelete: "RESTRICT" });
Doctor.hasMany(EncounterNote, { foreignKey: "doctorId", onDelete: "RESTRICT" });
Doctor.hasMany(Prescription,  { foreignKey: "doctorId", onDelete: "RESTRICT" });
Doctor.hasMany(LabOrder,      { foreignKey: "doctorId", onDelete: "RESTRICT" });

Appointment.belongsTo(Doctor,   { foreignKey: "doctorId" });
EncounterNote.belongsTo(Doctor, { foreignKey: "doctorId" });
Prescription.belongsTo(Doctor,  { foreignKey: "doctorId" });
LabOrder.belongsTo(Doctor,      { foreignKey: "doctorId" });

// Appointment → EncounterNote (one-to-one)
Appointment.hasOne(EncounterNote,    { foreignKey: "appointmentId", onDelete: "CASCADE" });
EncounterNote.belongsTo(Appointment, { foreignKey: "appointmentId" });

// Medication → Prescriptions
Medication.hasMany(Prescription,  { foreignKey: "medicationId", onDelete: "RESTRICT" });
Prescription.belongsTo(Medication, { foreignKey: "medicationId" });

// LabOrder → LabResult (one-to-one)
LabOrder.hasOne(LabResult,    { foreignKey: "labOrderId", onDelete: "CASCADE" });
LabResult.belongsTo(LabOrder, { foreignKey: "labOrderId" });

export {
    Role, User, Patient, Doctor, Medication,
    MedicalHistory, Appointment, EncounterNote,
    Prescription, LabOrder, LabResult
};