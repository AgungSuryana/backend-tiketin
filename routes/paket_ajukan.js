const express = require("express");
const db = require("../db/connection");
const { authenticateToken } = require("../middleware/authenticateToken");
const router = express.Router();

// Get all submitted packages for a user
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM paket_diajukan");
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get single submitted package by NIK
router.get("/:nik", authenticateToken, async (req, res) => {
    const { nik } = req.params;

    try {
        const [results] = await db.execute("SELECT * FROM paket_diajukan WHERE nik = ?", [nik]);
        if (results.length === 0) {
            return res.status(404).json({ message: "Submitted package not found" });
        }
        res.json(results[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new submitted package
router.post("/", async (req, res) => {
    const { nik, id_tiket_ajukan, nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    const query = "INSERT INTO paket_diajukan (nik, id_tiket_ajukan, nama_paket, harga_paket, gambar_venue, deskripsi_paket) VALUES (?, ?, ?, ?, ?, ?)";

    try {
        await db.execute(query, [nik, id_tiket_ajukan, nama_paket, harga_paket, gambar_venue, deskripsi_paket]);
        res.status(201).json({ message: "Submitted package created successfully" });
    } catch (err) {
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
            // Handle foreign key error (nik or id_tiket_ajukan not found)
            return res.status(400).json({
                error: "Error: Pastikan nik atau id_tiket_ajukan valid dan ada di database."
            });
        }
        return res.status(500).json({ error: err.message });
    }
});

// Update a submitted package
router.put("/:id_paket_diajukan", authenticateToken, async (req, res) => {
    const { id_paket_diajukan } = req.params;
    const { nama_paket, harga_paket, gambar_venue, deskripsi_paket } = req.body;

    const query =
        "UPDATE paket_diajukan SET nama_paket = ?, harga_paket = ?, gambar_venue = ?, deskripsi_paket = ? WHERE id_paket_diajukan = ?";

    try {
        await db.execute(query, [nama_paket, harga_paket, gambar_venue, deskripsi_paket, id_paket_diajukan]);
        res.json({ message: "Submitted package updated successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete a submitted package
router.delete("/:id_paket_diajukan", authenticateToken, async (req, res) => {
    const { id_paket_diajukan } = req.params;

    try {
        await db.execute("DELETE FROM paket_diajukan WHERE id_paket_diajukan = ?", [id_paket_diajukan]);
        res.json({ message: "Submitted package deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
