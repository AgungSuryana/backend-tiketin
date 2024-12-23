const express = require("express");
const db = require("../db/connection");
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");
const router = express.Router();


// GET kategori
router.get("/", authenticateToken, (req, res) => {
    db.query("SELECT * FROM kategori_tiket", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// Get single category by ID
router.get("/:id_kategori", authenticateToken, (req, res) => {
    const { id_kategori } = req.params;

    db.query("SELECT * FROM kategori WHERE id_kategori = ?", [id_kategori], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Category not found" });
        res.json(results[0]);
    });
});

// Create a new category
router.post("/", authenticateToken, (req, res) => {
    const { nama_kategori } = req.body;

    const query = "INSERT INTO kategori (nama_kategori) VALUES (?)";
    db.query(query, [nama_kategori], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Category created successfully" });
    });
});

// Update a category
router.put("/:id_kategori", authenticateToken, (req, res) => {
    const { id_kategori } = req.params;
    const { nama_kategori } = req.body;

    const query = "UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?";
    db.query(query, [nama_kategori, id_kategori], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Category updated successfully" });
    });
});

// Delete a category
router.delete("/:id_kategori", authenticateToken, (req, res) => {
    const { id_kategori } = req.params;

    db.query("DELETE FROM kategori WHERE id_kategori = ?", [id_kategori], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Category deleted successfully" });
    });
});


module.exports = router;