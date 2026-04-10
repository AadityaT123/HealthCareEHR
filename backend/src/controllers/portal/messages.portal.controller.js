import { Message, User } from "../../models/index.js";

// GET /portal/messages (Inbox)
export const getInbox = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { 
                portalUserId: req.portalUser.portalUserId,
                direction: "staff-to-patient"
            },
            include: [{ model: User, attributes: ["firstName", "lastName", "roleName"] }],
            order: [["createdAt", "DESC"]]
        });
        return res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error("getInbox error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /portal/messages/sent
export const getSentMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            where: { 
                portalUserId: req.portalUser.portalUserId,
                direction: "patient-to-staff"
            },
            include: [{ model: User, attributes: ["firstName", "lastName", "roleName"] }],
            order: [["createdAt", "DESC"]]
        });
        return res.status(200).json({ success: true, data: messages });
    } catch (err) {
        console.error("getSentMessages error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /portal/messages
export const sendMessage = async (req, res) => {
    try {
        const { staffUserId, subject, body, parentId } = req.body;
        
        if (!subject || !body)
            return res.status(400).json({ success: false, message: "Subject and body are required" });

        const message = await Message.create({
            patientId: req.portalUser.patientId,
            portalUserId: req.portalUser.portalUserId,
            staffUserId: staffUserId || null,
            direction: "patient-to-staff",
            subject,
            body,
            parentId: parentId || null
        });

        return res.status(201).json({ success: true, message: "Message sent", data: message });
    } catch (err) {
        console.error("sendMessage error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// PATCH /portal/messages/:id/read
export const markAsRead = async (req, res) => {
    try {
        const message = await Message.findOne({
            where: { id: req.params.id, portalUserId: req.portalUser.portalUserId }
        });

        if (!message)
            return res.status(404).json({ success: false, message: "Message not found" });

        if (!message.isRead) {
            await message.update({ isRead: true, readAt: new Date() });
        }

        return res.status(200).json({ success: true, message: "Message marked as read" });
    } catch (err) {
        console.error("markAsRead error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
