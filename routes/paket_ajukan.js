const express = require("express");
const db = require("../db/connection");
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");
const router = express.Router();

// Get all submitted packages for a user
// Get all submitted packages
router.get("/", authenticateToken, (req, res) => {
    // Ambil seluruh data paket_diajukan tanpa filter berdasarkan nik
    db.query("SELECT * FROM paket_diajukan", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get single submitted package
router.get("/:nik", authenticateToken, (req, res) => {
    const { nik } = req.params;

    db.query("SELECT * FROM paket_diajukan WHERE nik = ?", [nik], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Submitted package not found" });
        res.json(results[0]);
    });
});

// Create a new submitted package
router.post("/", authenticateToken, (req, res) => {
    const userNik = req.user.nik;
    const { nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    const query =
        "INSERT INTO paket_diajukan (nik, nama_paket, harga_paket, gambar_venue, deskripsi_paket) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [userNik, nama_paket, harga_paket, gambar_venue, deskripsi_paket], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Submitted package created successfully" });
    });
});

// Update a submitted package
router.put("/:id_paket_diajukan", authenticateToken, (req, res) => {
    const { id_paket_diajukan } = req.params;
    const { nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    const query =
        "UPDATE paket_diajukan SET nama_paket = ?, harga_paket = ?, gambar_venue = ?, deskripsi_paket = ? WHERE id_paket_diajukan = ?";
    db.query(query, [nama_paket, harga_paket, gambar_venue, deskripsi_paket, id_paket_diajukan], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Submitted package updated successfully" });
    });
});

// Delete a submitted package
router.delete("/:id_paket_diajukan", authenticateToken, (req, res) => {
    const { id_paket_diajukan } = req.params;

    db.query("DELETE FROM paket_diajukan WHERE id_paket_diajukan = ?", [id_paket_diajukan], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Submitted package deleted successfully" });
    });
});

module.exports = router;
