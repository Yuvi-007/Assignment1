const userModel = require('../models/users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function registerUser(req, res) {
    const { name, username, password, email, phone, role } = req.body;

    if (!name || !username || !password || !email) {
        return res.status(400).json({ message: "name, username, email, and password are required." });
    }

    try {
        const ifUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (ifUserAlreadyExists) {
            return res.status(400).json({ message: "User already exists." });
        }

        const hash = await bcrypt.hash(password, 10);

        const allowedRoles = ['user', 'manager'];
        const assignedRole = allowedRoles.includes(role) ? role : 'user';

        const user = await userModel.create({
            name,
            username,
            password: hash,
            email,
            phone,
            role: assignedRole
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: "User registered successfully.",
            user: { id: user._id }
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user.", error });
    }
}

async function loginUser(req, res) {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
        return res.status(400).json({ message: "Password and either username or email are required." });
    }

    try {
        const user = await userModel.findOne({
            $or: [
                ...(username ? [{ username }] : []),
                ...(email    ? [{ email }]    : [])
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "User logged in successfully.",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in.", error });
    }
}

async function seedAdmin(req, res) {
    try {
        const adminExists = await userModel.findOne({ role: 'admin' });

        if (adminExists) {
            return res.status(403).json({ message: "Admin already exists. This route is disabled." });
        }

        const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

        const admin = await userModel.create({
            name: process.env.ADMIN_NAME,
            username: process.env.ADMIN_USERNAME,
            email: process.env.ADMIN_EMAIL,
            password: hash,
            role: 'admin'
        });

        res.status(201).json({
            message: "Admin created successfully.",
            user: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating admin.", error });
    }
}

module.exports = { registerUser, loginUser, seedAdmin };