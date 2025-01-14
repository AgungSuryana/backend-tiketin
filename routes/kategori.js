const express = require("express");
const db = require("../db/connection");
const { authenticateToken } = require("../middleware/authenticateToken");
const router = express.Router();

// Get all categories
router.get("/", authenticateToken, async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM kategori_tiket");
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get single category by ID
router.get("/:id_kategori", authenticateToken, async (req, res) => {
    const { id_kategori } = req.params;

    try {
        const [results] = await db.execute("SELECT * FROM kategori WHERE id_kategori = ?", [id_kategori]);
        if (results.length === 0) return res.status(404).json({ message: "Category not found" });
        res.json(results[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new category
router.post("/", authenticateToken, async (req, res) => {
    const { nama_kategori } = req.body;

    const query = "INSERT INTO kategori (nama_kategori) VALUES (?)";

    try {
        await db.execute(query, [nama_kategori]);
        res.status(201).json({ message: "Category created successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update a category
router.put("/:id_kategori", authenticateToken, async (req, res) => {
    const { id_kategori } = req.params;
    const { nama_kategori } = req.body;

    const query = "UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?";

    try {
        await db.execute(query, [nama_kategori, id_kategori]);
        res.json({ message: "Category updated successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete a category
router.delete("/:id_kategori", authenticateToken, async (req, res) => {
    const { id_kategori } = req.params;

    try {
        await db.execute("DELETE FROM kategori WHERE id_kategori = ?", [id_kategori]);
        res.json({ message: "Category deleted successfully" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
