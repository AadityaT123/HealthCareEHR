import { createLabOrder } from "../models/labOrder.model.js";
import { labOrders, patients, doctors } from "../data/store.data.js";

const VALID_TEST_TYPES = ["Blood Test", "Urine Test", "X-Ray", "MRI", "CT Scan", "Ultrasound", "ECG", "Biopsy"];
const VALID_PRIORITIES = ["Routine", "Urgent", "STAT"];
const VALID_STATUSES   = ["Pending", "In Progress", "Completed", "Cancelled"];

// GET /api/lab-orders
const getAllLabOrders = (req, res) => {
    const { patientId, doctorId, status, priority, testType } = req.query;

    let result = labOrders;
    if (patientId) result = result.filter(l => l.patientId === patientId);
    if (doctorId)  result = result.filter(l => l.doctorId === doctorId);
    if (status)    result = result.filter(l => l.status.toLowerCase() === status.toLowerCase());
    if (priority)  result = result.filter(l => l.priority.toLowerCase() === priority.toLowerCase());
    if (testType)  result = result.filter(l => l.testType.toLowerCase() === testType.toLowerCase());

    res.status(200).json({ success: true, count: result.length, data: result });
};

// GET /api/lab-orders/:id
const getLabOrderById = (req, res) => {
    const labOrder = labOrders.find(l => l.id === req.params.id);
    if (!labOrder)
        return res.status(404).json({ success: false, message: "Lab order not found" });

    res.status(200).json({ success: true, data: labOrder });
};

// GET /api/lab-orders/patient/:patientId
const getLabOrdersByPatientId = (req, res) => {
    const patient = patients.find(p => p.id === req.params.patientId);
    if (!patient)
        return res.status(404).json({ success: false, message: "Patient not found" });

    const result = labOrders.filter(l => l.patientId === req.params.patientId);
    res.status(200).json({ success: true, count: result.length, data: result });
};

// GET /api/lab-orders/doctor/:doctorId
const getLabOrdersByDoctorId = (req, res) => {
    const doctor = doctors.find(d => d.id === req.params.doctorId);
    if (!doctor)
        return res.status(404).json({ success: false, message: "Doctor not found" });

    const result = labOrders.filter(l => l.doctorId === req.params.doctorId);
    res.status(200).json({ success: true, count: result.length, data: result });
};

// POST /api/lab-orders
const createLabOrderHandler = (req, res) => {
    const { patientId, doctorId, testType, orderDate, priority, notes } = req.body;

    // Required field validation
    const missing = [];
    if (!patientId) missing.push("patientId");
    if (!doctorId)  missing.push("doctorId");
    if (!testType)  missing.push("testType");
    if (!orderDate) missing.push("orderDate");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    // Validate patient exists
    const patient = patients.find(p => p.id === patientId);
    if (!patient)
        return res.status(404).json({ success: false, message: "Patient not found" });

    // Validate doctor exists and is active
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor)
        return res.status(404).json({ success: false, message: "Doctor not found" });
    if (!doctor.isActive)
        return res.status(400).json({ success: false, message: "Doctor is not active" });

    // Validate test type
    if (!VALID_TEST_TYPES.includes(testType))
        return res.status(400).json({ success: false, message: `Invalid testType. Must be one of: ${VALID_TEST_TYPES.join(", ")}` });

    // Validate priority if provided
    if (priority && !VALID_PRIORITIES.includes(priority))
        return res.status(400).json({ success: false, message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` });

    const labOrder = createLabOrder({ patientId, doctorId, testType, orderDate, priority, notes });
    labOrders.push(labOrder);

    res.status(201).json({ success: true, data: labOrder });
};

// PUT /api/lab-orders/:id
const updateLabOrder = (req, res) => {
    const index = labOrders.findIndex(l => l.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Lab order not found" });

    // Prevent update if already completed or cancelled
    if (["Completed", "Cancelled"].includes(labOrders[index].status))
        return res.status(400).json({ success: false, message: `Cannot update a ${labOrders[index].status} lab order` });

    if (req.body.status && !VALID_STATUSES.includes(req.body.status))
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });

    if (req.body.priority && !VALID_PRIORITIES.includes(req.body.priority))
        return res.status(400).json({ success: false, message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` });

    labOrders[index] = {
        ...labOrders[index],
        ...req.body,
        id:        labOrders[index].id,
        patientId: labOrders[index].patientId,  // prevent FK override
        doctorId:  labOrders[index].doctorId,   // prevent FK override
        createdAt: labOrders[index].createdAt,
        updatedAt: new Date().toISOString()
    };

    res.status(200).json({ success: true, data: labOrders[index] });
};

// DELETE /api/lab-orders/:id  (soft delete — sets status to Cancelled)
const deleteLabOrder = (req, res) => {
    const index = labOrders.findIndex(l => l.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Lab order not found" });

    if (labOrders[index].status === "Completed")
        return res.status(400).json({ success: false, message: "Cannot cancel a completed lab order" });

    labOrders[index].status    = "Cancelled";
    labOrders[index].updatedAt = new Date().toISOString();

    res.status(200).json({ success: true, message: "Lab order cancelled successfully" });
};

export {
    getAllLabOrders,
    getLabOrderById,
    getLabOrdersByPatientId,
    getLabOrdersByDoctorId,
    createLabOrderHandler,
    updateLabOrder,
    deleteLabOrder
};