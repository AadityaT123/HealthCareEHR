import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PortalUser, Patient, NotificationPreference } from "../../models/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "ehr_secret_key";

// POST /portal/auth/register
export const patientRegister = async (req, res) => {
    try {
        const { patientId, email, password } = req.body;

        // 1. Validate patient exists in standard patients table
        const patient = await Patient.findByPk(patientId);
        if (!patient)
            return res.status(404).json({ success: false, message: "Patient record not found." });

        // 2. Check if already registered
        const existingUser = await PortalUser.findOne({ where: { patientId } });
        if (existingUser)
            return res.status(400).json({ success: false, message: "Portal account already exists for this patient." });

        // 3. Check if email is taken globally in portal
        const existingEmail = await PortalUser.findOne({ where: { email } });
        if (existingEmail)
            return res.status(400).json({ success: false, message: "Email is already registered." });

        // 4. Validate password length
        if (!password || password.length < 8)
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });

        // 5. Hash & create
        const passwordHash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomUUID();

        const portalUser = await PortalUser.create({
            patientId,
            email,
            passwordHash,
            verificationToken,
            isVerified: false // in production, trigger email sending here
        });

        // 6. Auto-seed notification preferences
        await NotificationPreference.create({ portalUserId: portalUser.id });

        return res.status(201).json({ 
            success: true, 
            message: "Portal account created successfully. Please verify your email.",
            data: { id: portalUser.id, email: portalUser.email }
        });
    } catch (err) {
        console.error("patientRegister error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /portal/auth/login
export const patientLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const portalUser = await PortalUser.unscoped().findOne({ 
            where: { email },
            include: [{ model: Patient, attributes: ["firstName", "lastName"] }] 
        });

        // Vague error messaging to prevent enumeration
        if (!portalUser)
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        if (!portalUser.isActive)
            return res.status(403).json({ success: false, message: "Account is deactivated" });

        const isMatch = await bcrypt.compare(password, portalUser.passwordHash);
        if (!isMatch)
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        await portalUser.update({ lastLoginAt: new Date() });

        const token = jwt.sign(
            { 
                portalUserId: portalUser.id, 
                patientId: portalUser.patientId,
                email: portalUser.email, 
                role: "Patient" 
            },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            data: {
                token,
                portalUserId: portalUser.id,
                patientId: portalUser.patientId,
                patientName: `${portalUser.Patient.firstName} ${portalUser.Patient.lastName}`
            }
        });
    } catch (err) {
        console.error("patientLogin error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /portal/auth/verify/:token
export const verifyEmail = async (req, res) => {
    try {
        const portalUser = await PortalUser.findOne({ where: { verificationToken: req.params.token } });
        if (!portalUser)
            return res.status(400).json({ success: false, message: "Invalid or expired verification link." });

        await portalUser.update({ isVerified: true, verificationToken: null });
        return res.status(200).json({ success: true, message: "Email verified successfully." });
    } catch (err) {
        console.error("verifyEmail error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /portal/auth/me
export const getPortalMe = async (req, res) => {
    try {
        const portalUser = await PortalUser.findByPk(req.portalUser.portalUserId, {
            attributes: ["id", "email", "isActive", "isVerified", "lastLoginAt"],
            include: [{ model: Patient }]
        });

        if (!portalUser)
            return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, data: portalUser });
    } catch (err) {
        console.error("getPortalMe error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
