import { createAppointment } from "../models/appointment.model.js";
import { appointments, patients, doctors } from "../data/store.data.js";

const VALID_TYPES = [
  "Consultation",
  "Follow-up",
  "Emergency",
  "Routine Checkup",
];
const VALID_STATUSES = ["Scheduled", "Completed", "Cancelled", "No-Show"];

const getAllAppointments = (req, res) => {
  const { patientId, doctorId, status, appointmentType } = req.query;

  let result = appointments;
  if (patientId) result = result.filter((a) => a.patientId === patientId);
  if (doctorId) result = result.filter((a) => a.doctorId === doctorId);
  if (status) result = result.filter((a) => a.status.toLowerCase() === status);
  if (appointmentType)
    result = result.filter(
      (a) => a.appointmentType.toLowerCase() === appointmentType.toLowerCase(),
    );

  res.status(200).json({ success: true, count: result.length, data: result });
};

const getAppointmentById = (req, res) => {
  const appointement = appointments.find((a) => a.id === req.params.id);
  if (!appointement)
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });

  res.status(200).json({ success: true, data: appointement });
};

const getAppointmentByPatientId = (req, res) => {
  const patient = patients.find((p) => p.id === req.params.patientId);
  if (!patient)
    return res
      .status(404)
      .json({ success: false, message: "Patient not found" });

  const result = appointments.filter(
    (a) => a.patientId === req.params.patientId,
  );
  res.status(200).json({ success: true, count: result.length, data: result });
};

const getAppointmentByDoctorId = (req, res) => {
  const doctor = doctors.find((d) => d.id === req.params.doctorId);
  if (!doctor)
    return res
      .status(404)
      .json({ success: false, message: "Doctor not found" });

  const result = appointments.filter((a) => a.doctorId === req.params.doctorId);
  res.status(200).json({ success: true, count: result.length, data: result });
};

const createAppointmentHandler = (req, res) => {
  const {
    patientId,
    doctorId,
    appointmentDate,
    appointmentType,
    status,
    notes,
  } = req.body;

  const missing = [];
  if (!patientId) missing.push("patientId");
  if (!doctorId) missing.push("doctorId");
  if (!appointmentDate) missing.push("appointmentDate");
  if (!appointmentType) missing.push("appointmentType");

  if (missing.length > 0)
    return res
      .status(400)
      .json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });

  const patient = patients.find((p) => p.id === patientId);
  if (!patient)
    return res
      .status(404)
      .json({ success: false, message: "Patient not found" });

  const doctor = doctors.find((d) => d.id === doctorId);
  if (!doctor)
    return res
      .status(404)
      .json({ success: false, message: "Doctor not found" });

  if (!doctor.isActive)
    return res
      .status(400)
      .json({ success: false, message: "Doctor is not active" });

  if (!VALID_TYPES.includes(appointmentType))
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid appointment type. Must be one of: ${VALID_TYPES.join(", ")}`,
      });

  if (!VALID_STATUSES.includes(status))
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });

  if (status && !VALID_STATUSES.includes(status))
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });

  const conflict = appointments.find(
    (a) =>
      a.doctorId === doctorId &&
      a.appointmentDate === appointmentDate &&
      a.status === "Scheduled",
  );
  if (conflict)
    return res
      .status(409)
      .json({
        success: false,
        message: "Doctor has another scheduled appointment at the same time",
      });

  const appointment = createAppointment({
    patientId,
    doctorId,
    appointmentDate,
    appointmentType,
    status,
    notes,
  });
  appointments.push(appointment);

  res.status(201).json({ success: true, data: appointment });
};

const updateAppointment = (req, res) => {
  const index = appointments.findIndex((a) => a.id === req.params.id);
  if (index === -1)
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });

  const validStatuses = ["Scheduled", "Completed", "Cancelled"];
  if (req.body.status && !validStatuses.included(req.body.status))
    return res
      .status(400)
      .json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });

  appointments[index] = {
    ...appointments[index],
    ...req.body,
    id: appointments[index].id,
    createdAt: appointments[index].createdAt,
    updatedAt: new Date().toString(),
  };

  res.status(200).json({ success: true, data: appointments[index] });
};

const deleteAppointment = (req, res) => {
  const index = appointments.findIndex((a) => a.id === req.params.id);
  if (index === -1)
    return res
      .status(404)
      .json({ success: false, message: "Appointment not found" });

  appointments[index].status = "Cancelled";
  appointments[index].updatedAt = new Date().toISOString();

  res
    .status(200)
    .json({ success: true, message: "Appointment cancelled successfully" });
};

export {
  getAllAppointments,
  getAppointmentById,
  getAppointmentByPatientId,
  getAppointmentByDoctorId,
  createAppointmentHandler,
  updateAppointment,
  deleteAppointment,
};
