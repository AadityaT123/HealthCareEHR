import Role             from "./role.model.js";
import User             from "./user.model.js";
import Patient          from "./patient.model.js";
import Doctor           from "./doctor.model.js";
import Medication       from "./medication.model.js";
import MedicalHistory   from "./medicalHistory.model.js";
import Appointment      from "./appointment.model.js";
import EncounterNote    from "./encounterNote.model.js";
import Prescription     from "./prescription.model.js";
import LabOrder         from "./labOrder.model.js";
import LabResult        from "./labResult.model.js";
import ProgressNote     from "./progressNote.model.js";
import DocumentTemplate from "./documentTemplate.model.js";

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
Medication.hasMany(Prescription,   { foreignKey: "medicationId", onDelete: "RESTRICT" });
Prescription.belongsTo(Medication, { foreignKey: "medicationId" });

// LabOrder → LabResult (one-to-one)
LabOrder.hasOne(LabResult,    { foreignKey: "labOrderId", onDelete: "CASCADE" });
LabResult.belongsTo(LabOrder, { foreignKey: "labOrderId" });

// ProgressNote associations
Patient.hasMany(ProgressNote,      { foreignKey: "patientId", onDelete: "CASCADE" });
ProgressNote.belongsTo(Patient,    { foreignKey: "patientId" });

Doctor.hasMany(ProgressNote,       { foreignKey: "doctorId",  onDelete: "RESTRICT" });
ProgressNote.belongsTo(Doctor,     { foreignKey: "doctorId" });

// Optional link: EncounterNote → ProgressNote (one encounter can have many progress notes)
EncounterNote.hasMany(ProgressNote,  { foreignKey: "encounterId", onDelete: "SET NULL" });
ProgressNote.belongsTo(EncounterNote, { foreignKey: "encounterId", as: "encounter" });

// DocumentTemplate associations
User.hasMany(DocumentTemplate,          { foreignKey: "createdBy", onDelete: "RESTRICT" });
DocumentTemplate.belongsTo(User,        { foreignKey: "createdBy", as: "creator" });

export {
    Role, User, Patient, Doctor, Medication,
    MedicalHistory, Appointment, EncounterNote,
    Prescription, LabOrder, LabResult,
    ProgressNote, DocumentTemplate
};