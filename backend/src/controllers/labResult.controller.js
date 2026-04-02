import { createLabResult } from "../models/labResult.model.js";
import { labResults, labOrders } from "../data/store.data.js";
import { sendCriticalResultAlert } from "../utils/notificationService.js";

const VALID_STATUSES = ["Normal", "Abnormal", "Critical"];

// GET /api/lab-results
const getAllLabResults = (req, res) => {
    const { labOrderId, status } = req.query;

    let result = labResults;
    if (labOrderId) result = result.filter(r => r.labOrderId === labOrderId);
    if (status)     result = result.filter(r => r.status.toLowerCase() === status.toLowerCase());

    res.status(200).json({ success: true, count: result.length, data: result });
};

// GET /api/lab-results/:id
const getLabResultById = (req, res) => {
    const result = labResults.find(r => r.id === req.params.id);
    if (!result)
        return res.status(404).json({ success: false, message: "Lab result not found" });

    res.status(200).json({ success: true, data: result });
};

// GET /api/lab-results/order/:labOrderId
const getLabResultsByOrderId = (req, res) => {
    const labOrder = labOrders.find(l => l.id === req.params.labOrderId);
    if (!labOrder)
        return res.status(404).json({ success: false, message: "Lab order not found" });

    const results = labResults.filter(r => r.labOrderId === req.params.labOrderId);
    res.status(200).json({ success: true, count: results.length, data: results });
};

// GET /api/lab-results/critical
const getCriticalLabResults = (req, res) => {
    const results = labResults.filter(r => r.isCritical === true);
    res.status(200).json({ success: true, count: results.length, data: results });
};

// POST /api/lab-results
const createLabResultHandler = (req, res) => {
    const { labOrderId, resultValue, resultDate, unit, referenceRange, status, notes } = req.body;

    // Required field validation
    const missing = [];
    if (!labOrderId)   missing.push("labOrderId");
    if (!resultValue)  missing.push("resultValue");
    if (!resultDate)   missing.push("resultDate");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    // Validate lab order exists
    const labOrder = labOrders.find(l => l.id === labOrderId);
    if (!labOrder)
        return res.status(404).json({ success: false, message: "Lab order not found" });

    // Prevent result if lab order is cancelled
    if (labOrder.status === "Cancelled")
        return res.status(400).json({ success: false, message: "Cannot add result to a cancelled lab order" });

    // Validate status
    if (status && !VALID_STATUSES.includes(status))
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });

    // Prevent duplicate result for same lab order
    const exists = labResults.find(r => r.labOrderId === labOrderId);
    if (exists)
        return res.status(409).json({ success: false, message: "A result already exists for this lab order" });

    const labResult = createLabResult({ labOrderId, resultValue, resultDate, unit, referenceRange, status, notes });
    labResults.push(labResult);

    // Auto update lab order status to Completed
    const labOrderIndex = labOrders.findIndex(l => l.id === labOrderId);
    if (labOrderIndex !== -1) {
        labOrders[labOrderIndex].status    = "Completed";
        labOrders[labOrderIndex].updatedAt = new Date().toISOString();
    }

    // Trigger critical result alert
    if (labResult.isCritical)
        sendCriticalResultAlert(labResult, labOrder);

    res.status(201).json({
        success: true,
        data: labResult,
        ...(labResult.isCritical && { alert: "⚠️ Critical result — relevant staff have been notified" })
    });
};

// PUT /api/lab-results/:id
const updateLabResult = (req, res) => {
    const index = labResults.findIndex(r => r.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Lab result not found" });

    if (req.body.status && !VALID_STATUSES.includes(req.body.status))
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });

    // Recalculate isCritical if status changes
    const updatedStatus = req.body.status || labResults[index].status;

    labResults[index] = {
        ...labResults[index],
        ...req.body,
        id:         labResults[index].id,
        labOrderId: labResults[index].labOrderId,   // prevent FK override
        isCritical: updatedStatus === "Critical",
        createdAt:  labResults[index].createdAt,
        updatedAt:  new Date().toISOString()
    };

    res.status(200).json({ success: true, data: labResults[index] });
};

// DELETE /api/lab-results/:id
const deleteLabResult = (req, res) => {
    const index = labResults.findIndex(r => r.id === req.params.id);
    if (index === -1)
        return res.status(404).json({ success: false, message: "Lab result not found" });

    // Revert lab order status back to In Progress
    const labOrderIndex = labOrders.findIndex(l => l.id === labResults[index].labOrderId);
    if (labOrderIndex !== -1) {
        labOrders[labOrderIndex].status    = "In Progress";
        labOrders[labOrderIndex].updatedAt = new Date().toISOString();
    }

    labResults.splice(index, 1);
    res.status(200).json({ success: true, message: "Lab result deleted successfully" });
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