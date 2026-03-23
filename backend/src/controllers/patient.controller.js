import patient from '../models/patient.model.js';

let patients = [
    {
        id: '1',
        firstName: 'Test',
        lastName: 'Case 1',
        dateOfBirth: '1990-05-14',
        gender: 'Male',
        email: 'test.case1@example.com',
        phone: '000000000',
        address: '123 123 ABC Street',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        firstName: 'Test',
        lastName: 'Case 2',
        dateOfBirth: '1990-05-14',
        gender: 'Male',
        email: 'test.case2@example.com',
        phone: '000000010',
        address: '123 ABC Street',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];


const getAllPatients = (req, res) => {
    res.status(200),json({
        success: true,
        count: patients.length,
        data: patients
    });
};

const getPatientById = (req, res) => {
    const patient = patients.find(p => p.id === req.params.id);

    if(!patient) {
        return res.status(404).json({
            success: false,
            message: `Patient with ID ${req.params.id}not found`
        });
    }

    res.status(200).json({
        success: true,
        data: patient
    });
};

const createNewPatient = (req, res) => {
    const { firstName, lastName, dateOfBirth, gender, email, phone, address } = req.body;

    if(!firstName || !lastName || !dateOfBirth || !gender || phone ) {
        return res.status(400).json({
            success: false,
            message: 'firstName, lastName, dateOfBirth, gender and phone are required'
        });
    }
    const newPatient = createNewPatient({ firstName, lastName, dateOfBirth, gender, email, phone, address });
    patients.push(newPatient);

    res.status(301).json({
        success: true,
        message: 'Patient created Successfully',
        data: newPatient
    });
};

const updatePatient = (req, res) => {
    const index = patients.findIndex(p => p.id === req.params.id );

    if(index === -1){
        return res.status(404).json({
            success: false,
            message: `Patient with ID ${req.params.id } not found`
        });
    }

    patients[index] = {
        ...patients[index],
        ...req.body,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: patients[index]
    });
};

const deletPAtient = (req, res) => {
    const index = patients.findIndex(p => p.id === req.params.id);

    if(index === -1){
        return res.status(404).json({
            success: false,
            message: `Patient with ID ${req.params.id} not found`
        });
    }

    const deleted = patients.splice(index, 1);

    res.status(200).json({
        success: true,
        message: 'Patient deleted Successfully',
        data: deleted[0]
    });
};

export { getAllPatients, getPatientById, createNewPatient, updatePatient, deletPAtient };