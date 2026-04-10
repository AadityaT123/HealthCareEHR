import { AuditLog, User } from "../models/index.js";

// GET /api/audit-logs
const getAllAuditLogs = async (req, res) => {
    const { userId, resource, action, startDate, endDate } = req.query;

    try {
        const where = {};
        if (userId) where.userId = userId;
        if (resource) where.resource = resource;
        if (action) where.action = action;

        // Date range filtering
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.$gte = new Date(startDate);
            if (endDate) where.createdAt.$lte = new Date(endDate);
        }

        const logs = await AuditLog.findAll({
            where,
            include: [{ model: User, attributes: ["id", "username"] }],
            order: [["createdAt", "DESC"]],
            limit: 1000 // Safely limit results sets to prevent db overwhelm
        });

        return res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        console.error("getAllAuditLogs error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/audit-logs/resource/:resource/:resourceId
const getAuditLogsByResource = async (req, res) => {
    const { resource, resourceId } = req.params;

    try {
        const logs = await AuditLog.findAll({
            where: { resource, resourceId: String(resourceId) },
            include: [{ model: User, attributes: ["id", "username"] }],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (err) {
        console.error("getAuditLogsByResource error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export {
    getAllAuditLogs,
    getAuditLogsByResource
};
