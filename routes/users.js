const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/connection");
const cookieParser = require("cookie-parser");
const router = express.Router();
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");


// Gunakan cookie-parser sebagai middleware
router.use(cookieParser());

// Register a new user
router.post("/register", async (req, res) => {
    const { no_telp, nama_user, email_user, password_user, role } = req.body;

    // Cek apakah no_telp sudah terdaftar
    db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            return res.status(400).json({ message: "Phone number already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password_user, 10);

        // Insert new user
        const query = "INSERT INTO users (no_telp, nama_user, email_user, password_user, role) VALUES (?, ?, ?, ?, ?)";
        db.query(query, [no_telp, nama_user, email_user, hashedPassword, role], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Create JWT token
            const token = jwt.sign(
                { no_telp, nama_user, email_user, role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Set token ke cookies
            res.cookie("token", token, {
                httpOnly: true, // Agar cookie tidak bisa diakses oleh JavaScript
                secure: process.env.NODE_ENV === "production", // Set ke true hanya di produksi
                maxAge: 3600000, // 1 hour in milliseconds
                sameSite: 'Strict', // Pilihan untuk pembatasan pengiriman cookies
            });

            // Kirim response dengan data user
            res.status(201).json({ message: "User registered successfully", user: { no_telp, nama_user, email_user, role } });
        });
    });
});

// Login user
router.post("/login", (req, res) => {
    const { no_telp, password_user } = req.body;

    // Validasi input
    if (!no_telp || !password_user) {
        return res.status(400).json({ message: "Phone number and password are required" });
    }

    // Cek apakah no_telp terdaftar
    db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp], async (err, results) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ message: "Internal server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        // Verifikasi password
        try {
            const isPasswordValid = await bcrypt.compare(password_user, user.password_user);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid password" });
            }
        } catch (error) {
            console.error("Password verification error:", error.message);
            return res.status(500).json({ message: "Password verification failed" });
        }

        // Generate token JWT
        const token = jwt.sign(
            { no_telp: user.no_telp, nama_user: user.nama_user, email_user: user.email_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Cetak token ke console untuk debugging
        console.log("Generated Token:", token);

        // Set token ke cookies
        res.cookie("token", token, {
            httpOnly: true, // Agar cookie tidak bisa diakses oleh JavaScript
            secure: process.env.NODE_ENV === "production", // Set ke true hanya di produksi
            maxAge: 3600000, // 1 hour in milliseconds
            sameSite: 'Strict', // Pilihan untuk pembatasan pengiriman cookies
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
    });
});

router.get("/", authenticateToken, (req, res) => {
    db.query("SELECT * FROM users ", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});


router.get("/profile/:no_telp", (req, res) => {
    const { no_telp } = req.params; // Retrieve no_telp from URL parameters

    // Query to fetch user data based on no_telp
    db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return the first user found
        res.status(200).json(results[0]);
    });
});

module.exports = router;

