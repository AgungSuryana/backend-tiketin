const express = require("express");
const db = require("../db/connection");
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");
const router = express.Router();

// Get all packages
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM paket");
        res.status(200).json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get a single package
router.get("/:id_paket", authenticateToken, async (req, res) => {
    const { id_paket } = req.params;

    try {
        const [results] = await db.execute("SELECT * FROM paket WHERE id_paket = ?", [id_paket]);
        if (results.length === 0) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json(results[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get package by ticket ID
router.get("/tiket/:id_tiket", async (req, res) => {
    const { id_tiket } = req.params;

    try {
        const [results] = await db.execute("SELECT * FROM paket WHERE id_tiket = ?", [id_tiket]);
        if (results.length === 0) {
            return res.status(404).json({ message: "Package not found" });
        }
        res.status(200).json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new package
router.post("/", authenticateToken, authorizeRole("admin"), async (req, res) => {
    const { id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    if (!id_tiket || !nama_paket || !harga_paket || !gambar_venue || !deskripsi_paket) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "INSERT INTO paket (id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket) VALUES (?, ?, ?, ?, ?)";
    try {
        await db.execute(query, [id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket]);
        res.status(201).json({ message: "Package created successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update a package
router.put("/:id_paket", authenticateToken, authorizeRole("admin"), async (req, res) => {
    const { id_paket } = req.params;
    const { id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    if (!id_tiket || !nama_paket || !harga_paket || !gambar_venue || !deskripsi_paket) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const query = "UPDATE paket SET id_tiket = ?, nama_paket = ?, harga_paket = ?, gambar_venue = ?, deskripsi_paket = ? WHERE id_paket = ?";
    try {
        await db.execute(query, [id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket, id_paket]);
        res.status(200).json({ message: "Package updated successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete a package
router.delete("/:id_paket", authenticateToken, authorizeRole("admin"), async (req, res) => {
    const { id_paket } = req.params;

    try {
        await db.execute("DELETE FROM paket WHERE id_paket = ?", [id_paket]);
        res.status(200).json({ message: "Package deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
