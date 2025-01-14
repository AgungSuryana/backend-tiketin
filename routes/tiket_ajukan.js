const express = require("express");
const db = require("../db/connection");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

// Daftar kategori yang diperbolehkan
const allowedCategories = ['seminar', 'konser', 'sport', 'pameran'];

// Get all submitted tickets
router.get("/", async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM tiket_diajukan");
        if (results.length === 0) return res.status(404).json({ message: "No tickets found" });
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get all submitted tickets for a specific NIK (by no_telp)
router.get("/:no_telp", async (req, res) => {
    const { no_telp } = req.params;
    try {
        const [results] = await db.execute("SELECT * FROM tiket_diajukan WHERE no_telp = ?", [no_telp]);
        if (results.length === 0) return res.status(404).json({ message: "No tickets found for this NIK" });
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get a single submitted ticket by ID
router.get("/detail/:id_tiket", authenticateToken, async (req, res) => {
    const { id_tiket } = req.params;
    try {
        const [results] = await db.execute("SELECT * FROM tiket_diajukan WHERE id_tiket = ?", [id_tiket]);
        if (results.length === 0) return res.status(404).json({ message: "Submitted ticket not found" });
        res.json(results[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new submitted ticket
router.post("/", async (req, res) => {
    const { nik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan } = req.body;

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const query = `
        INSERT INTO tiket_diajukan (nik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
        await db.execute(query, [nik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan || "Pending"]);
        res.status(201).json({ message: "Submitted ticket created successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update the status of a submitted ticket by id_tiket_ajukan
router.put("/:id_tiket_ajukan", authenticateToken, async (req, res) => {
    const { id_tiket_ajukan } = req.params;
    const { status_pengajuan } = req.body;

    // Pastikan status_pengajuan valid
    if (!['Disetujui', 'Pending', 'Ditolak'].includes(status_pengajuan)) {
        return res.status(400).json({ error: 'Invalid status_pengajuan' });
    }

    const query = `
        UPDATE tiket_diajukan 
        SET status_pengajuan = ? 
        WHERE id_tiket_ajukan = ?
    `;
    try {
        await db.execute(query, [status_pengajuan, id_tiket_ajukan]);
        res.json({ message: "Status pengajuan berhasil diperbarui" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get tickets status for a specific NIK (by no_telp)
router.get("/status/:no_telp", async (req, res) => {
    const { no_telp } = req.params;
    try {
        const [results] = await db.execute("SELECT * FROM tiket_diajukan WHERE no_telp = ?", [no_telp]);
        if (results.length === 0) return res.status(404).json({ message: "No tickets found for this NIK" });
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete a submitted ticket by ID
router.delete("/:id_tiket", authenticateToken, async (req, res) => {
    const { id_tiket } = req.params;
    try {
        await db.execute("DELETE FROM tiket_diajukan WHERE id_tiket = ?", [id_tiket]);
        res.json({ message: "Submitted ticket deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
