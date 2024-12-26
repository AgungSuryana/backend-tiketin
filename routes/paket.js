const express = require("express");
const db = require("../db/connection");
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");
const router = express.Router();

// Get all packages
router.get("/", authenticateToken, (req, res) => {
    db.query("SELECT * FROM paket", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
});

// Get single package
router.get("/:id_paket", authenticateToken, (req, res) => {
    const { id_paket } = req.params;

    db.query("SELECT * FROM paket WHERE id_paket = ?", [id_paket], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json(results[0]);
    });
});
router.get("/tiket/:id_tiket", (req, res) => {
    const { id_tiket } = req.params;

    db.query("SELECT * FROM paket WHERE id_tiket = ?", [id_tiket], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json(results);
    });
});

// Create a new package
router.post("/", authenticateToken, authorizeRole("admin"), (req, res) => {
    const { id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    if (!id_tiket || !nama_paket || !harga_paket || !gambar_venue || !deskripsi_paket) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query =
        "INSERT INTO paket (id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Package created successfully" });
    });
});

// Update a package
router.put("/:id_paket", authenticateToken, authorizeRole("admin"), (req, res) => {
    const { id_paket } = req.params;
    const { id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    if (!id_tiket || !nama_paket || !harga_paket || !gambar_venue || !deskripsi_paket) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query =
        "UPDATE paket SET id_tiket = ?, nama_paket = ?, harga_paket = ?, gambar_venue = ?, deskripsi_paket = ? WHERE id_paket = ?";
    db.query(query, [id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket, id_paket], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Package updated successfully" });
    });
});

// Delete a package
router.delete("/:id_paket", authenticateToken, authorizeRole("admin"), (req, res) => {
    const { id_paket } = req.params;

    db.query("DELETE FROM paket WHERE id_paket = ?", [id_paket], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "Package deleted successfully" });
    });
});

module.exports = router;
