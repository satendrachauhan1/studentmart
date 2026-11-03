const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    bio: user.bio || "",
    studentId: user.studentId || "",
    department: user.department || "",
    semester: user.semester || "",
    pickupLocation: user.pickupLocation || "",
    gender: user.gender || "",
    createdAt: user.createdAt
});

// ===============================
// TEST ROUTE
// ===============================
router.get("/test", (req, res) => {
    res.json({
        message: "Auth route is working"
    });
});

// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, gender = "" } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        // Check required fields
        if (typeof name !== "string" || !name.trim() || !normalizedEmail || typeof password !== "string") {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        // Check password length
        if (!validEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }
        if (!["", "female", "male", "prefer-not-to-say"].includes(gender)) {
            return res.status(400).json({ message: "Please choose a valid gender option" });
        }
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            gender
        });

        // Send response
        res.status(201).json({
            message: "Registration successful",
            user: {
                ...publicUser(user)
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// ===============================
// LOGIN
// ===============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        // Check required fields
        if (!normalizedEmail || typeof password !== "string" || !validEmail(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        // Find user by email
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare entered password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                ...publicUser(user)
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// PROTECTED USER PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile accessed successfully",
            user: publicUser(user)
        });

    } catch (error) {
        console.error("Profile Error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

router.patch("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, email, phone, bio, studentId, department, semester, pickupLocation, gender } = req.body;
        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ message: "Name is required" });
        }
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        if (!validEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }
        if (phone !== undefined && (typeof phone !== "string" || phone.length > 20)) {
            return res.status(400).json({ message: "Phone number must be 20 characters or fewer" });
        }
        if (bio !== undefined && (typeof bio !== "string" || bio.length > 300)) {
            return res.status(400).json({ message: "Bio must be 300 characters or fewer" });
        }
        const profileFields = [[studentId, 30, "Student ID"], [department, 100, "Department"], [semester, 40, "Semester"], [pickupLocation, 120, "Pickup location"]];
        for (const [value, maxLength, label] of profileFields) {
            if (value !== undefined && (typeof value !== "string" || value.length > maxLength)) return res.status(400).json({ message: `${label} must be ${maxLength} characters or fewer` });
        }
        if (gender !== undefined && !["", "male", "female", "prefer-not-to-say"].includes(gender)) return res.status(400).json({ message: "Choose a valid gender preference" });
        const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
        if (duplicate) return res.status(409).json({ message: "That email is already in use" });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.name = name.trim();
        user.email = normalizedEmail;
        user.phone = phone?.trim() || "";
        user.bio = bio?.trim() || "";
        user.studentId = studentId?.trim() || "";
        user.department = department?.trim() || "";
        user.semester = semester?.trim() || "";
        user.pickupLocation = pickupLocation?.trim() || "";
        if (gender !== undefined) user.gender = gender;
        await user.save();
        res.json({ message: "Profile updated", user: publicUser(user) });
    } catch (error) {
        console.error("Profile update error:", error);
        if (error.code === 11000) return res.status(409).json({ message: "That email is already in use" });
        if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
        res.status(500).json({ message: "Unable to update profile" });
    }
});

router.patch("/change-password", authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
            return res.status(400).json({ message: "Enter your current and new password" });
        }
        if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
        if (currentPassword === newPassword) return res.status(400).json({ message: "New password must differ from the current password" });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Password change error:", error);
        res.status(500).json({ message: "Unable to change password" });
    }
});

module.exports = router;
