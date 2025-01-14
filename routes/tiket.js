const express = require("express");
const db = require("../db/connection");
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");
const router = express.Router();

// Get all tickets (Accessible to all authenticated users)
router.get("/all", async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM tiket");
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get all tickets (Accessible only to admins)
router.get("/", authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM tiket");
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get single ticket (Accessible to all authenticated users)
router.get('/:id_tiket', authenticateToken, async (req, res) => {
    const { id_tiket } = req.params;
    try {
        const [results] = await db.execute('SELECT * FROM tiket WHERE id_tiket = ?', [id_tiket]);
        if (results.length === 0) return res.status(404).json({ message: 'Ticket not found' });
        res.json(results[0]);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create a new ticket (Admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { kategori, nama_acara, lokasi, tanggal_acara, deskripsi, poster } = req.body;
    const allowedCategories = ['seminar', 'konser', 'sport', 'pameran']; // Contoh nilai ENUM

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const query = `
        INSERT INTO tiket (kategori, nama_acara, lokasi, tanggal_acara, deskripsi, poster) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    try {
        await db.execute(query, [kategori, nama_acara, lokasi, tanggal_acara, deskripsi, poster]);
        res.status(201).json({ message: 'Ticket created successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update a ticket (Admin only)
router.put('/:id_tiket', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id_tiket } = req.params;
    const { kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status } = req.body;
    const allowedCategories = ['seminar', 'konser', 'sport', 'pameran']; // Contoh nilai ENUM

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const queryUpdateTicket = `
        UPDATE tiket
        SET kategori = ?, nama_acara = ?, lokasi = ?, tanggal_acara = ?, poster = ?, deskripsi = ?, status = ?, updated_at = NOW()
        WHERE id_tiket = ?
    `;
    try {
        await db.execute(queryUpdateTicket, [kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status, id_tiket]);
        res.json({ message: 'Ticket updated successfully' });
    } catch (err) {
        console.error('Error updating ticket:', err);
        return res.status(500).json({ error: 'Gagal memperbarui tiket' });
    }
});

// Delete a ticket (Admin only)
router.delete('/:id_tiket', authenticateToken, authorizeRole('admin'), async (req, res) => {
    const { id_tiket } = req.params;
    try {
        await db.execute('DELETE FROM tiket WHERE id_tiket = ?', [id_tiket]);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
