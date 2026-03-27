import { createRole } from '../models/role.model.js';
import { roles } from '../data/store.data.js';

// let roles = [
//     { id: "1", roleName: "Admin", description: "Full System Access" },
//     { id: "2", roleName: "Doctor", description: "Clinical documentation and orders" },
//     { id: "3", roleName: "Nurse", description: "Medication administration and notes" },
//     { id: "4", roleName: "Pharmacist", description: "Medication Management" },
//     { id: "5", roleName: "Lab Technician", description: "Lab orders and results" },
//     { id: "6", roleName: "Receptionist", description: "Patient registration and appointments" }
// ];

const getAllRoles = (req, res) => {
    res.status(200).json({ success: true, count: roles.length, data: roles });
};

const getRoleById = (req, res) => {
    const role = roles.find(r => r.id === req.params.id);
    if(!role)
        return res.status(404).json({ success: false, message: "Role not found" });


    res.status(200).json({ success: true, data: role });
};

const createRoleHandler = (req, res) => {
    const { roleName, description } = req.body;

    if(!roleName) 
        return res.status(400).json({ success: false, message: "roleName is required" });

    const exists = roles.find(r => r.roleName.toLowerCase() === roleName.toLowerCase());
    if(exists)
        return res.status(409).json({ success: false, message: "Role already exists" });

    const role = createRole({ roleName, description });
    roles.push(role);

    res.status(201).json({ success: true, data: role });
};

const updateRole = (req, res) => {
    const index = roles.findIndex(r => r.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: " Role not founf" });

    roles[index] = {
        ...roles[index],
        ...req.body,
        id: roles[index].id,
        createdAt: roles[index].createdAt,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json({ success: true, data: roles[index] });
};

const deleteRole = (req, res) => {
    const index = roles.findIndex(r => r.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: " Role not founf" });

    roles.splice(index, 1);

    res.status(200).json({ success: true, message: "Role deleted Successfully" });
};

export { getAllRoles, getRoleById, createRoleHandler, updateRole, deleteRole };