const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const db = require("../db/connection");
const cookieParser = require("cookie-parser");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");

// Gunakan cookie-parser sebagai middleware
router.use(cookieParser());

// Fungsi untuk menangani error
const handleError = (res, error, status = 500) => {
    console.error("Error:", error.message);
    return res.status(status).json({ error: error.message });
};

// Register a new user
router.post("/register", async (req, res) => {
    const { no_telp, nama_user, email_user, password_user, role } = req.body;

    try {
        // Cek apakah no_telp sudah terdaftar
        const [existingUser] = await db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Phone number already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password_user, 10);

        // Insert new user
        const query = "INSERT INTO users (no_telp, nama_user, email_user, password_user, role) VALUES (?, ?, ?, ?, 'user')";
        await db.query(query, [no_telp, nama_user, email_user, hashedPassword, role]);

        // Create JWT token
        const token = jwt.sign(
            { no_telp, nama_user, email_user, role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set token ke cookies
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
            sameSite: 'Strict',
        });

        // Kirim response dengan data user
        res.status(201).json({ message: "User registered successfully", user: { no_telp, nama_user, email_user, role } });
    } catch (error) {
        handleError(res, error);
    }
});

// Login user
router.post("/login", async (req, res) => {
    const { no_telp, password_user } = req.body;

    if (!no_telp || !password_user) {
        return res.status(400).json({ message: "Phone number and password are required" });
    }

    try {
        // Cek apakah no_telp terdaftar
        const [results] = await db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp]);
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password_user, user.password_user);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate token JWT
        const token = jwt.sign(
            { no_telp: user.no_telp, nama_user: user.nama_user, email_user: user.email_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set token ke cookies
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
            sameSite: 'Strict',
        });

        // Kirimkan response dengan data user
        res.json({
            message: "Login successful",
            role: user.role,
            token: token,
            user: {
                no_telp: user.no_telp,
                nama_user: user.nama_user,
                email_user: user.email_user,
            },
        });
    } catch (error) {
        handleError(res, error);
    }
});

// Mendapatkan semua user
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM users");
        res.status(200).json(results);
    } catch (error) {
        handleError(res, error);
    }
});

// Mendapatkan profil user berdasarkan no_telp
router.get("/profile/:no_telp", async (req, res) => {
    const { no_telp } = req.params;

    try {
        const [results] = await db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp]);
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(results[0]);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router;
