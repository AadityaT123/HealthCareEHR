import { createDoctor } from "../models/doctor.model.js";
import { doctors } from "../data/store.data.js";

const getAllDoctors = (req, res) => {
    const { specialization } = req.query;

    let result = doctors;
    if(specialization) 
        result = result.filter(d => d.specialization.toLowerCase() === specialization.toLowerCase());

    res.status(200).json({ success: true, count: result.length, data: result });

};

const getDoctorById = (req, res) => {
    const doctor = doctor.find(d => d.id === req.params.id );
    if(!doctor)  
        return res.status(404).json({ success: false, message: "Doctor not found" });

    res.status(200).json({ success: true, data: doctor });
};

const createDoctorHandler = (req, res) => {
    const { firstName, lastName, specialization, email, phone, licenseNumber } = req.body;

    const missing = [];

    if(!firstName) missing.push("firstName");
    if(!lastName) missing.push("lastName");
    if(!specialization) missing.push("specialization");
    if(!email) missing.push("email");
    if(!phone) missing.push("phone");
    if(!licenseNumber) missing.push("licenseNumber");

    if(missing.length > 0) 
        return res.status(400).json({ success: false, message: `Missing fields  : ${missing.join(", ")}` });

    const existing = doctors.find(d => d.licenseNumber === licenseNumber );
    if(existing)
        return res.status(409).json({ success: false, message: "A doctor with this license number already exists" });

    const emailExists = doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
    if(emailExists)
        return res.status(409).json({ success: false, message: "A docotor with same email address is already exists" });

    const doctor = createDoctor({ firstName, lastName, specialization, email, phone, licenseNumber });
    doctors.push(doctor);

    res.status(201).json({ success: true, data: doctor });
};

const updateDoctor = (req, res) => {
    const index = doctors.findIndex(d => d.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: "Doctor not found" });

    if(req.bosy.licenseNumber){
        const duplicate = doctors.find(d => d.licenseNumber === req.body.licenseNumber && d.id !== req.params.id);
        if(duplicate)
            return res.status(409).json({ success: false, message: "License number already exists" });

    }

    doctors[index] = {
        ...doctors[index],
        ...req.body,
        id: doctors[index].id,
        createdAt: doctors[index].createdAt,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json({ success: true, data: doctors[index] });
};

const deleteDoctor = (req, res) => {
    const index = doctors.findIndex(d => d.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: "Doctor not found" });
    
    doctors.splice(index, 1);
    res.status(200).json({ success: true, message: "Doctor deleted successfully" });
};

const deactivateDoctor = (req, res) => {
    const index = doctors.findIndex(d => d.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: "Doctor not found" });

    doctors[index].isActive = false;
    doctors[index].updatedAt = new Date().toISOString();

    res.status(200).json({ success: true, message: "Doctor deactivated successfully" });
};

export { getAllDoctors, getDoctorById, createDoctorHandler, updateDoctor, deleteDoctor, deactivateDoctor };