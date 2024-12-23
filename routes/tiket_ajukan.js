const express = require("express");
const db = require("../db/connection");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

// Daftar kategori yang diperbolehkan
const allowedCategories = ['seminar', 'konser', 'sports', 'pameran'];

// Get all submitted tickets for a specific NIK
router.get("/", authenticateToken, (req, res) => {
    // Ambil seluruh data tanpa filter berdasarkan nik
    db.query("SELECT * FROM tiket_diajukan", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "No tickets found" });
        res.json(results);
    });
});

// Get all submitted tickets for a specific NIK
router.get("/:nik", authenticateToken, (req, res) => {
    const { nik } = req.params;

    db.query("SELECT * FROM tiket_diajukan WHERE nik = ?", [nik], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "No tickets found for this NIK" });
        res.json(results);
    });
});

// Get a single submitted ticket by ID
router.get("/detail/:id_tiket", authenticateToken, (req, res) => {
    const { id_tiket } = req.params;

    db.query("SELECT * FROM tiket_diajukan WHERE id_tiket = ?", [id_tiket], (err, results) => {
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

// Update a submitted ticket by ID
router.put("/:id_tiket", authenticateToken, (req, res) => {
    const { id_tiket } = req.params;
    const { nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan } = req.body;

    const query =
        "UPDATE tiket_diajukan SET nama_acara = ?, lokasi = ?, tanggal_acara = ?, poster = ?, deskripsi = ?, status_pengajuan = ? WHERE id_tiket = ?";
    db.query(
        query,
        [nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan, id_tiket],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Submitted ticket updated successfully" });
        }
    );
});

// Delete a submitted ticket by ID
router.delete("/:id_tiket", authenticateToken, (req, res) => {
    const { id_tiket } = req.params;

    db.query("DELETE FROM tiket_diajukan WHERE id_tiket = ?", [id_tiket], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Submitted ticket deleted successfully" });
    });
});

module.exports = router;
