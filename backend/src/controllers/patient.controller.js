import { createPatient } from "../models/patient.model.js";
import { patients } from "../data/store.data.js";

// let patients = [
//     {
//         id: '1',
//         firstName: 'Test',
//         lastName: 'Case 1',
//         dateOfBirth: '1990-05-14',
//         gender: 'Male',
//         email: 'test.case1@example.com',
//         phone: '000000000',
//         address: '123 123 ABC Street',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//     },
//     {
//         id: '2',
//         firstName: 'Test',
//         lastName: 'Case 2',
//         dateOfBirth: '1990-05-14',
//         gender: 'Male',
//         email: 'test.case2@example.com',
//         phone: '000000010',
//         address: '123 ABC Street',
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//     }
// ];

const getAllPatients = (req, res) => {
  const { gender, name } = req.query;

  let result = patients;

  if (gender)
    result = result.filter(
      (p) => p.gender.toLowerCase() === gender.toLowerCase(),
    );

  if (name)
    result = result.filter(
      (p) =>
        p.firstName.toLowerCase().includes(name.toLowerCase()) ||
        p.lastName.toLowerCase().includes(name.toLowerCase()),
    );
  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
};

const getPatientById = (req, res) => {
  const patient = patients.find((p) => p.id === req.params.id);

  if (!patient) {
    return res.status(404).json({
      success: false,
      message: `Patient with ID ${req.params.id}not found`,
    });
  }

  res.status(200).json({
    success: true,
    data: patient,
  });
};

const createPatientHandler = (req, res) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    contactInformation,
    insuranceDetails,
  } = req.body;

  const missing = [];
  if (!firstName) missing.push("firstName");
  if (!lastName) missing.push("lastName");
  if (!dateOfBirth) missing.push("dateOfBirth");
  if (!gender) missing.push("gender");

  if (missing.length > 0)
    return res
      .status(400)
      .json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });

  if (
    !contactInformation ||
    !contactInformation.email ||
    !contactInformation.phone
  )
    return res
      .status(400)
      .json({
        success: false,
        message: "contactInformation must include email and phone",
      });

  const validGenders = ["Male", "Female", "Other"];
  if (!validGenders.includes(gender))
    return res
      .status(400)
      .json({ success: false, message: `Invalid gender. ` });

  const emailExists = patients.find(
    (p) =>
      p.contactInformation.email.toLowerCase() ===
      contactInformation.email.toLowerCase(),
  );
  if (emailExists)
    return res
      .status(409)
      .json({ success: false, message: `Email already exists. ` });

  const patient = createPatient({
    firstName,
    lastName,
    dateOfBirth,
    gender,
    contactInformation,
    insuranceDetails,
  });
  patients.push(patient);

  res.status(201).json({
    success: true,
    message: "Patient created Successfully",
    data: patient,
  });
};

const updatePatient = (req, res) => {
  const index = patients.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Patient with ID ${req.params.id} not found`,
    });
  }

  if (req.body.contactInformation?.email) {
    const emailExists = patients.find(
      (p) =>
        p.contactInformation.email.toLowerCase() ===
          req.body.contactInformation.email.toLowerCase() &&
        p.id !== req.params.id,
    );
    if (emailExists)
      return res
        .status(409)
        .json({ success: false, message: `Email already exists. ` });
  }

  patients[index] = {
    ...patients[index],
    ...req.body,
    contactInformation: {
      ...patients[index].contactInformation,
      ...req.body.contactInformation,
    },
    insuranceDetails: {
      ...patients[index].insuranceDetails,
      ...req.body.insuranceDetails,
    },
    id: patients[index].id,
    createdAt: patients[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    message: "Patient updated successfully",
    data: patients[index],
  });
};

const deletePatient = (req, res) => {
  const index = patients.findIndex((p) => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: `Patient with ID ${req.params.id} not found`,
    });
  }

  patients.splice(index, 1);

  res.status(200).json({
    success: true,
    message: "Patient deleted Successfully",
  });
};

export {
  getAllPatients,
  getPatientById,
  createPatientHandler,
  updatePatient,
  deletePatient,
};
