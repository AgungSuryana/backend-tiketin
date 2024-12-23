const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db/connection");
const router = express.Router();

// Get all users (Admin only)
router.get("/", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single user
router.get("/:no_telp", (req, res) => {
    const { no_telp } = req.params;
    db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(results[0]);
    });
});

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

            // Send response with token
            res.status(201).json({ message: "User registered successfully", token });
        });
    });
});

// Login user
router.post("/login", (req, res) => {
    const { no_telp, password_user } = req.body;

    // Cek apakah no_telp terdaftar
    db.query("SELECT * FROM users WHERE no_telp = ?", [no_telp], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = results[0];

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password_user, user.password_user);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Generate token JWT
        const token = jwt.sign(
            { no_telp: user.no_telp, nama_user: user.nama_user, email_user: user.email_user, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Kirimkan token ke klien
        res.json({ message: "Login successful", token });
    });
});


// Update user
router.put("/:no_telp", async (req, res) => {
    const { no_telp } = req.params;
    const { nama_user, email_user, password_user, role } = req.body;
    const hashedPassword = password_user ? await bcrypt.hash(password_user, 10) : null;

    const query = "UPDATE users SET nama_user = ?, email_user = ?, password_user = ?, role = ? WHERE no_telp = ?";
    db.query(
        query,
        [nama_user, email_user, hashedPassword, role, no_telp],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User updated successfully" });
        }
    );
});

// Delete user
router.delete("/:no_telp", (req, res) => {
    const { no_telp } = req.params;
    db.query("DELETE FROM users WHERE no_telp = ?", [no_telp], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User deleted successfully" });
    });
});

module.exports = router;
