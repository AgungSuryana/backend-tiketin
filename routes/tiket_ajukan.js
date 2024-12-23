const express = require("express");
const db = require("../db/connection");
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");

const router = express.Router();

// Daftar kategori yang diperbolehkan
const allowedCategories = ['seminar', 'konser', 'sports', 'pameran'];

// Get all submitted tickets for a user
router.get("/", authenticateToken, (req, res) => {
    const userNik = req.user.nik;

    db.query("SELECT * FROM tiket_diajukan", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single submitted ticket
router.get("/:kategori", authenticateToken, (req, res) => {
    const { kategori } = req.params;

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    db.query("SELECT * FROM tiket_diajukan WHERE kategori = ?", [kategori], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Submitted ticket not found" });
        res.json(results[0]);
    });
});

// Create a new submitted ticket
router.post("/", authenticateToken, (req, res) => {
    const userNik = req.user.nik;
    const { no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan } = req.body;

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const query =
        "INSERT INTO tiket_diajukan (nik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
        query,
        [userNik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan || "Pending"],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Submitted ticket created successfully" });
        }
    );
});

// Update a submitted ticket
router.put("/:kategori", authenticateToken, (req, res) => {
    const { kategori } = req.params;
    const { nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan } = req.body;

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const query =
        "UPDATE tiket_diajukan SET nama_acara = ?, lokasi = ?, tanggal_acara = ?, poster = ?, deskripsi = ?, status_pengajuan = ? WHERE kategori = ?";
    db.query(
        query,
        [nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan, kategori],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Submitted ticket updated successfully" });
        }
    );
});

// Delete a submitted ticket
router.delete("/:kategori", authenticateToken, (req, res) => {
    const { kategori } = req.params;

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    db.query("DELETE FROM tiket_diajukan WHERE kategori = ?", [kategori], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Submitted ticket deleted successfully" });
    });
});

module.exports = router;
