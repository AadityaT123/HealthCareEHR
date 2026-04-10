import { LabOrder, Patient, Doctor, sequelize } from "../models/index.js";
import integrations from "../integrations/index.js";

const VALID_TEST_TYPES = ["Blood Test", "Urine Test", "X-Ray", "MRI", "CT Scan", "Ultrasound", "ECG", "Biopsy"];
const VALID_PRIORITIES = ["Routine", "Urgent", "STAT"];
const VALID_STATUSES   = ["Pending", "In Progress", "Completed", "Cancelled"];

// GET /api/lab-orders
const getAllLabOrders = async (req, res) => {
    const { patientId, doctorId, status, priority, testType } = req.query;

    try {
        const where = {};
        if (patientId) where.patientId = patientId;
        if (doctorId)  where.doctorId  = doctorId;
        if (status)    where.status    = status;
        if (priority)  where.priority  = priority;
        if (testType)  where.testType  = testType;

        const labOrders = await LabOrder.findAll({
            where,
            include: [
                { model: Patient, attributes: ["id", "firstName", "lastName"] },
                { model: Doctor,  attributes: ["id", "firstName", "lastName", "specialization"] }
            ],
            order: [["orderDate", "DESC"]]
        });
        return res.status(200).json({ success: true, count: labOrders.length, data: labOrders });
    } catch (err) {
        console.error("getAllLabOrders error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/lab-orders/:id
const getLabOrderById = async (req, res) => {
    try {
        const labOrder = await LabOrder.findByPk(req.params.id, {
            include: [
                { model: Patient, attributes: ["id", "firstName", "lastName"] },
                { model: Doctor,  attributes: ["id", "firstName", "lastName"] }
            ]
        });
        if (!labOrder)
            return res.status(404).json({ success: false, message: "Lab order not found" });

        return res.status(200).json({ success: true, data: labOrder });
    } catch (err) {
        console.error("getLabOrderById error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/lab-orders/patient/:patientId
const getLabOrdersByPatientId = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.patientId);
        if (!patient)
            return res.status(404).json({ success: false, message: "Patient not found" });

        const labOrders = await LabOrder.findAll({
            where: { patientId: req.params.patientId },
            include: [{ model: Doctor, attributes: ["id", "firstName", "lastName"] }],
            order: [["orderDate", "DESC"]]
        });
        return res.status(200).json({ success: true, count: labOrders.length, data: labOrders });
    } catch (err) {
        console.error("getLabOrdersByPatientId error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/lab-orders/doctor/:doctorId
const getLabOrdersByDoctorId = async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.doctorId);
        if (!doctor)
            return res.status(404).json({ success: false, message: "Doctor not found" });

        const labOrders = await LabOrder.findAll({
            where: { doctorId: req.params.doctorId },
            include: [{ model: Patient, attributes: ["id", "firstName", "lastName"] }],
            order: [["orderDate", "DESC"]]
        });
        return res.status(200).json({ success: true, count: labOrders.length, data: labOrders });
    } catch (err) {
        console.error("getLabOrdersByDoctorId error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/lab-orders
const createLabOrderHandler = async (req, res) => {
    const { patientId, doctorId, testType, orderDate, priority, notes } = req.body;

    const missing = [];
    if (!patientId) missing.push("patientId");
    if (!doctorId)  missing.push("doctorId");
    if (!testType)  missing.push("testType");
    if (!orderDate) missing.push("orderDate");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    if (!VALID_TEST_TYPES.includes(testType))
        return res.status(400).json({ success: false, message: `Invalid testType. Must be one of: ${VALID_TEST_TYPES.join(", ")}` });

    if (priority && !VALID_PRIORITIES.includes(priority))
        return res.status(400).json({ success: false, message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` });

    try {
        const patient = await Patient.findByPk(patientId);
        if (!patient)
            return res.status(404).json({ success: false, message: "Patient not found" });

        const doctor = await Doctor.findByPk(doctorId);
        if (!doctor)
            return res.status(404).json({ success: false, message: "Doctor not found" });
        if (!doctor.isActive)
            return res.status(400).json({ success: false, message: "Doctor is not active" });

        const t = await sequelize.transaction();

        try {
            const labOrder = await LabOrder.create({
                patientId, doctorId, testType, orderDate,
                priority: priority || "Routine",
                notes
            }, { transaction: t });

            // [Phase 3] Integration: Send to LIS
            await integrations.lis.sendLabOrder(labOrder);

            await t.commit();
            return res.status(201).json({ success: true, data: labOrder });

        } catch (innerErr) {
            await t.rollback();
            throw innerErr;
        }

    } catch (err) {
        console.error("createLabOrder error:", err.message || err);
        if (err.message && err.message.includes("Mock") || err.message.includes("mock integration")) {
            return res.status(502).json({ success: false, message: "External LIS Integration Failed. Operation rolled back." });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/lab-orders/:id
const updateLabOrder = async (req, res) => {
    try {
        const labOrder = await LabOrder.findByPk(req.params.id);
        if (!labOrder)
            return res.status(404).json({ success: false, message: "Lab order not found" });

        if (["Completed", "Cancelled"].includes(labOrder.status))
            return res.status(400).json({ success: false, message: `Cannot update a ${labOrder.status} lab order` });

        if (req.body.status && !VALID_STATUSES.includes(req.body.status))
            return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });

        if (req.body.priority && !VALID_PRIORITIES.includes(req.body.priority))
            return res.status(400).json({ success: false, message: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}` });

        // Prevent FK overrides
        const { patientId: _, doctorId: __, ...updateData } = req.body;
        await labOrder.update(updateData);

        return res.status(200).json({ success: true, data: labOrder });
    } catch (err) {
        console.error("updateLabOrder error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE /api/lab-orders/:id  (soft cancel)
const deleteLabOrder = async (req, res) => {
    try {
        const labOrder = await LabOrder.findByPk(req.params.id);
        if (!labOrder)
            return res.status(404).json({ success: false, message: "Lab order not found" });

        if (labOrder.status === "Completed")
            return res.status(400).json({ success: false, message: "Cannot cancel a completed lab order" });

        await labOrder.update({ status: "Cancelled" });
        return res.status(200).json({ success: true, message: "Lab order cancelled successfully" });
    } catch (err) {
        console.error("deleteLabOrder error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
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