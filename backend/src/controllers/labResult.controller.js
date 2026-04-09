import { LabResult, LabOrder, Patient } from "../models/index.js";
import { sendCriticalResultAlert } from "../utils/notificationService.js";

const VALID_STATUSES = ["Normal", "Abnormal", "Critical"];

// GET /api/lab-results
const getAllLabResults = async (req, res) => {
    const { labOrderId, status } = req.query;

    try {
        const where = {};
        if (labOrderId) where.labOrderId = labOrderId;
        if (status)     where.status     = status;

        const results = await LabResult.findAll({
            where,
            include: [{ model: LabOrder, attributes: ["id", "testType", "orderDate", "patientId", "doctorId"] }],
            order: [["resultDate", "DESC"]]
        });
        return res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
        console.error("getAllLabResults error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/lab-results/:id
const getLabResultById = async (req, res) => {
    try {
        const result = await LabResult.findByPk(req.params.id, {
            include: [{ model: LabOrder, attributes: ["id", "testType", "orderDate"] }]
        });
        if (!result)
            return res.status(404).json({ success: false, message: "Lab result not found" });

        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error("getLabResultById error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/lab-results/order/:labOrderId
const getLabResultsByOrderId = async (req, res) => {
    try {
        const labOrder = await LabOrder.findByPk(req.params.labOrderId);
        if (!labOrder)
            return res.status(404).json({ success: false, message: "Lab order not found" });

        const results = await LabResult.findAll({ where: { labOrderId: req.params.labOrderId } });
        return res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
        console.error("getLabResultsByOrderId error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/lab-results/critical
const getCriticalLabResults = async (req, res) => {
    try {
        const results = await LabResult.findAll({
            where: { isCritical: true },
            include: [{ model: LabOrder, attributes: ["id", "testType", "patientId", "doctorId"] }],
            order: [["resultDate", "DESC"]]
        });
        return res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
        console.error("getCriticalLabResults error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/lab-results
const createLabResultHandler = async (req, res) => {
    const { labOrderId, resultValue, resultDate, unit, referenceRange, status, notes } = req.body;

    const missing = [];
    if (!labOrderId)   missing.push("labOrderId");
    if (!resultValue)  missing.push("resultValue");
    if (!resultDate)   missing.push("resultDate");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    if (status && !VALID_STATUSES.includes(status))
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });

    try {
        const labOrder = await LabOrder.findByPk(labOrderId);
        if (!labOrder)
            return res.status(404).json({ success: false, message: "Lab order not found" });

        if (labOrder.status === "Cancelled")
            return res.status(400).json({ success: false, message: "Cannot add result to a cancelled lab order" });

        // Prevent duplicate result for same lab order
        const exists = await LabResult.findOne({ where: { labOrderId } });
        if (exists)
            return res.status(409).json({ success: false, message: "A result already exists for this lab order" });

        const isCritical = status === "Critical";

        const labResult = await LabResult.create({
            labOrderId, resultValue, resultDate, unit,
            referenceRange, notes,
            status: status || "Normal",
            isCritical
        });

        // Auto-update lab order status to Completed
        await labOrder.update({ status: "Completed" });

        // Trigger critical result alert
        if (isCritical) sendCriticalResultAlert(labResult, labOrder);

        return res.status(201).json({
            success: true,
            data: labResult,
            ...(isCritical && { alert: "⚠️ Critical result — relevant staff have been notified" })
        });
    } catch (err) {
        console.error("createLabResult error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PUT /api/lab-results/:id
const updateLabResult = async (req, res) => {
    try {
        const result = await LabResult.findByPk(req.params.id);
        if (!result)
            return res.status(404).json({ success: false, message: "Lab result not found" });

        if (req.body.status && !VALID_STATUSES.includes(req.body.status))
            return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });

        const updatedStatus = req.body.status || result.status;
        const { labOrderId: _, ...updateData } = req.body;

        await result.update({ ...updateData, isCritical: updatedStatus === "Critical" });
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error("updateLabResult error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE /api/lab-results/:id
const deleteLabResult = async (req, res) => {
    try {
        const result = await LabResult.findByPk(req.params.id);
        if (!result)
            return res.status(404).json({ success: false, message: "Lab result not found" });

        // Revert lab order status to In Progress
        const labOrder = await LabOrder.findByPk(result.labOrderId);
        if (labOrder) await labOrder.update({ status: "In Progress" });

        await result.destroy();
        return res.status(200).json({ success: true, message: "Lab result deleted successfully" });
    } catch (err) {
        console.error("deleteLabResult error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export {
    getAllLabResults,
    getLabResultById,
    getLabResultsByOrderId,
    getCriticalLabResults,
    createLabResultHandler,
    updateLabResult,
    deleteLabResult
};