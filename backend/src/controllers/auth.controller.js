import bycrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { createUser } from '../models/user.model.js';
import { roles, users } from '../data/store.data.js';       

const JWT_SECRET = process.env.JWT_SECRET || 'ehr_secret_key';
const JWT_EXPIRES_IN = '40min';

const register = async (req, res) => {
    const { username, password, roleId } = req.body;

    const missing = [];
    if( !username) missing.push("username");
    if( !password) missing.push("password");
    if( !roleId) missing.push("roleId");

    if(missing.length > 0)
        return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(", ")}` });

    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if(existingUser) 
        return res.status(409).json({ success: false, message: "USername already exists" });

    const roleExists = roles.find(r => r.id === roleId);
    if(!roleExists)
        return res.status(400).json({ success: false, message: "Invalid roleId - role does not exists" });

    if(password.length < 8)
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    const passwordHash = await bycrypt.hash(password, 10);
    const user = createUser ({ username, passwordHash, roleId });
    users.push(user);

    res.status(201).json({
        success: true,
        data: {
            id: user.id,
            username: user.username,
            roleId: user.roleId,
            roleName: roleExists.roleName,
            createdAt: user.createdAt
        }
    });
};

const login = async(req, res) => {
    const { username, password } = req.body;
    if(!username || !password) 
        return res.status(400).json({ success: false, message: "Username and Password are required" });

    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if(!user)
        return res.status(401).json({ success: false, message: "Invalid credentials" });

    if(!user.isActive)
        return res.status(403).json({ success: false, message: "Account is deactivated" });

    const isMatch = await bycrypt.compare(password, user.passwordHash);
    if(!isMatch)
        return res.status(401).json({ success: false, message: "Invalid credentials" });

    const role = roles.find(r => r.id === user.roleId);

    const token = jwt.sign(
        { 
            userId: user.id,
            username: user.username,
            roleID: user.roleId,
            roleName: role?.roleName
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                username: user.username,
                roleId: user.roleId,
                roleName: role.roleName
            }
        }
    });
};

const getMe = (req, res) => {
    res.status(200).json({ success: true, data: req.user });
};

const deactivateUser = (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if(index === -1)
        return res.status(404).json({ success: false, message: "User not found" });

    users[index].isActive = false;
    users[index].updatedAt = new Date().toISOString();

    res.status(200).json({ success: true, message: "User deactivated successfully" });
};

export { register, login, getMe, deactivateUser };