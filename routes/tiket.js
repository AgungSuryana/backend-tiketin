const express = require("express");
const db = require("../db/connection");
const { authenticateToken, authorizeRole } = require("../middleware/authenticateToken");
const router = express.Router();

// Get all tickets (Accessible to all authenticated users)
router.get("/all", (req, res) => {
    db.query("SELECT * FROM tiket", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get all tickets (Accessible only to admins)
router.get("/", authenticateToken, authorizeRole('admin'), (req, res) => {
    db.query("SELECT * FROM tiket", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// Get single ticket (Accessible to all authenticated users)
router.get('/:id_tiket', authenticateToken, (req, res) => {
    const { id_tiket } = req.params;
    db.query('SELECT * FROM tiket WHERE id_tiket = ?', [id_tiket], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Ticket not found' });
        res.json(results[0]);
    });
});

// Create a new ticket (Admin only)
router.post('/', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { kategori, nama_acara, lokasi, tanggal_acara, deskripsi, poster } = req.body;
    const allowedCategories = ['seminar', 'konser', 'sport', 'pameran']; // Contoh nilai ENUM

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const query =
        'INSERT INTO tiket (kategori, nama_acara, lokasi, tanggal_acara, deskripsi, poster) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [kategori, nama_acara, lokasi, tanggal_acara, deskripsi, poster], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Ticket created successfully' });
    });
});

router.put('/:id_tiket', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id_tiket } = req.params;
    const { kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status } = req.body;
    const allowedCategories = ['seminar', 'konser', 'sport', 'pameran']; // Contoh nilai ENUM

    console.log('Received data:', { kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status });

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const queryUpdateTicket = `
        UPDATE tiket
        SET kategori = ?, nama_acara = ?, lokasi = ?, tanggal_acara = ?, poster = ?, deskripsi = ?, status = ?, updated_at = NOW()
        WHERE id_tiket = ?
    `;
    db.query(queryUpdateTicket, [kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status, id_tiket], (err) => {
        if (err) {
            console.error('Error updating ticket:', err);
            return res.status(500).json({ error: 'Gagal memperbarui tiket' });
        }
        res.json({ message: 'Ticket updated successfully' });
    });
});

// Delete a ticket (Admin only)
router.delete('/:id_tiket', authenticateToken, authorizeRole('admin'), (req, res) => {
    const { id_tiket } = req.params;
    db.query('DELETE FROM tiket WHERE id_tiket = ?', [id_tiket], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Ticket deleted successfully' });
    });
});

module.exports = router;
