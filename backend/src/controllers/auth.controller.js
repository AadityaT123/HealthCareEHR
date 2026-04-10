import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "../models/index.js";

const JWT_SECRET     = process.env.JWT_SECRET || "ehr_secret_key";
const JWT_EXPIRES_IN = "8h";

// POST /api/auth/register
const register = async (req, res) => {
    const { username, password, roleId } = req.body;

    const missing = [];
    if (!username) missing.push("username");
    if (!password) missing.push("password");
    if (!roleId)   missing.push("roleId");

    if (missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    if (password.length < 8)
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    try {
        const roleExists = await Role.findByPk(roleId);
        if (!roleExists)
            return res.status(400).json({ success: false, message: "Invalid roleId — role does not exist" });

        const existingUser = await User.findOne({ where: { username: username.toLowerCase() } });
        if (existingUser)
            return res.status(409).json({ success: false, message: "Username already exists" });

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ username: username.toLowerCase(), passwordHash, roleId });

        return res.status(201).json({
            success: true,
            data: {
                id:        user.id,
                username:  user.username,
                roleId:    user.roleId,
                roleName:  roleExists.roleName,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ success: false, message: "Username and password are required" });

    try {
        const user = await User.unscoped().findOne({
            where: { username: username.toLowerCase() },
            include: [{ model: Role, attributes: ["roleName"] }]
        });

        if (!user)
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        if (!user.isActive)
            return res.status(403).json({ success: false, message: "Account is deactivated" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(401).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign(
            {
                userId:   user.id,
                username: user.username,
                roleId:   user.roleId,
                roleName: user.Role?.roleName
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        return res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    id:       user.id,
                    username: user.username,
                    roleId:   user.roleId,
                    roleName: user.Role?.roleName
                }
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// GET /api/auth/me
const getMe = (req, res) => {
    res.status(200).json({ success: true, data: req.user });
};

// PATCH /api/auth/deactivate/:id
const deactivateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user)
            return res.status(404).json({ success: false, message: "User not found" });

        await user.update({ isActive: false });
        return res.status(200).json({ success: true, message: "User deactivated successfully" });
    } catch (err) {
        console.error("Deactivate error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { register, login, getMe, deactivateUser };