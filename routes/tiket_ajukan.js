const express = require("express");
const db = require("../db/connection");
const { authenticateToken } = require("../middleware/authenticateToken");

const router = express.Router();

// Daftar kategori yang diperbolehkan
const allowedCategories = ['seminar', 'konser', 'sport', 'pameran'];

// Get all submitted tickets for a specific NIK
router.get("/",(req, res) => {
    // Ambil seluruh data tanpa filter berdasarkan nik
    db.query("SELECT * FROM tiket_diajukan", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "No tickets found" });
        res.json(results);
    });
});



// Get all submitted tickets for a specific NIK
router.get("/:no_telp", (req, res) => {
    const { no_telp } = req.params;

    db.query("SELECT * FROM tiket_diajukan WHERE no_telp= ?", [no_telp], (err, results) => {
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
router.post("/", (req, res) => {
    const { nik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan } = req.body;

    if (!allowedCategories.includes(kategori)) {
        return res.status(400).json({ error: `Kategori harus salah satu dari: ${allowedCategories.join(', ')}` });
    }

    const query =
        "INSERT INTO tiket_diajukan (nik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
        query,
        [nik, no_telp, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan || "Pending"],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Submitted ticket created successfully" });
        }
    );
});

// // Update a submitted ticket by ID
// router.put("/:id_tiket", authenticateToken, (req, res) => {
//     const { id_tiket } = req.params;
//     const { nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan } = req.body;

//     const query =
//         "UPDATE tiket_diajukan SET nama_acara = ?, lokasi = ?, tanggal_acara = ?, poster = ?, deskripsi = ?, status_pengajuan = ? WHERE id_tiket = ?";
//     db.query(
//         query,
//         [nama_acara, lokasi, tanggal_acara, poster, deskripsi, status_pengajuan, id_tiket],
//         (err) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json({ message: "Submitted ticket updated successfully" });
//         }
//     );
// });

// Update the status of a submitted ticket by id_tiket_diajukan
router.put("/:id_tiket_ajukan", authenticateToken, (req, res) => {
    const { id_tiket_ajukan } = req.params;  // Sesuaikan dengan parameter URL yang benar
    const { status_pengajuan } = req.body;

    // Pastikan status_pengajuan valid
    if (!['Disetujui', 'Pending', 'Ditolak'].includes(status_pengajuan)) {
        return res.status(400).json({ error: 'Invalid status_pengajuan' });
    }

    const query = `
        UPDATE tiket_diajukan 
        SET status_pengajuan = ? 
        WHERE id_tiket_ajukan = ?`;  // Pastikan query juga menggunakan id_tiket_ajukan

    db.query(query, [status_pengajuan, id_tiket_ajukan], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Status pengajuan berhasil diperbarui" });
    });
});



router.get("/status/:no_telp", (req, res) => {
    const { no_telp } = req.params;

    db.query("SELECT * FROM tiket_diajukan WHERE no_telp = ?", [no_telp], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "No tickets found for this NIK" });
        res.json(results);
    });
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
