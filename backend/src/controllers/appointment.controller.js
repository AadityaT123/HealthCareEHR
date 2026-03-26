import { createAppointment } from "../models/appointment.model.js";

let appointments = [];

const getAllAppointments = (req, res) => {
    const { patientId, status } = req.query;

    let result = appointments;
    if(patientId) result = result.filter(a => a.patientId === patientId);
    if(status) result = result.filter(a => a.status.toLowerCase() === status);

    res.status(200).json({ success: true, count: result.length, data: result });
};

const getAppointmentById = (req, res ) => {
    const appointement = appointments.find(a => a.id === req.params.id);
    if(!appointement) return res.status(404).json({ success: true, message: "Appointment not found" });

    res.status(200).json({ success: true, data: appointement });
};

const createAppointmentHandler = (req, res ) => {
    const { patientId, doctorId, appointmentDate, time, appointmentType, status, notes  } = req.body;

    const missing = [];
    if(!patientId) missing.push("patientId");
    if(!doctorId) missing.push("doctorId");
    if(!appointmentDate) missing.push("appointmentDate");
    if(!time) missing.push("time");
    if(!appointmentType) missing.push("appointmentType");

    if(missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    const validTypes = ["Consultation", "Follow-up", "Emergency", "Routine Checkup"];
    const validStatuses = ["Scheduled", "Completed", "Cancelled" ];

    if(!validTypes.includes(appointmentType))
        return res.status(400).json({ success: false, message: `Invalid type. Must be one of: ${validTypes.join(", ")}` });

    const appointmentStatus = status || "Scheduled";
    if(!validStatuses.includes(appointmentStatus))
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });

    const appointment = createAppointment({ patientId, doctorId, appointmentDate, time, appointmentType, status: appointmentStatus, notes });
    appointments.push(appointment);

    res.status(201).json({ success: true, data: appointment });
};

const updateAppointment = (req, res) => {
    const index = appointments.findIndex(a => a.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: "Appointment not found" });

    const validStatuses = ["Scheduled", "Completed", "Cancelled"];
    if(req.body.status && !validStatuses.included(req.body.status))
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });

    appointments[index] = {
        ...appointments[index],
        ...req.body,
        id: appointments[index].id,
        createdAt: appointments[index].createdAt,
        updatedAt: new Date().toString()
    };

    res.status(200).json({ success: true, data: appointments[index] });
};


const deleteAppointment = (req, res) => {
    const index = appointments.findIndex(a => a.id === req.params.id);
    if(index === -1) 
        return res.status(404).json({ success: false, message: "Appointment not found" });

    appointments.splice(index, 1);
    res.status(200).json({ success: true, message: "Appointment deleted successfully" });
};

export { getAllAppointments, getAppointmentById, createAppointmentHandler, updateAppointment, deleteAppointment };