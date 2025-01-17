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

router.put("/:id_tiket_ajukan", authenticateToken, async (req, res) => {
    const { id_tiket_ajukan } = req.params;
    const { status_pengajuan, kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, nik } = req.body;

    // Pastikan status_pengajuan valid
    if (!['Disetujui', 'Pending', 'Ditolak'].includes(status_pengajuan)) {
        return res.status(400).json({ error: 'Invalid status_pengajuan' });
    }

    // Validasi bahwa semua parameter yang diperlukan ada dan tidak undefined
    if (!kategori || !nama_acara || !lokasi || !tanggal_acara || !poster || !deskripsi || !nik) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        UPDATE tiket_diajukan 
        SET status_pengajuan = ? 
        WHERE id_tiket_ajukan = ?
    `;

    try {
        await db.execute(query, [status_pengajuan, id_tiket_ajukan]);

        // Jika status_pengajuan berubah menjadi 'Disetujui'
        if (status_pengajuan === 'Disetujui') {
            // Menyisipkan data ke tabel Tiket
            const insertTiketQuery = `
                INSERT INTO Tiket (kategori, nama_acara, lokasi, tanggal_acara, poster, deskripsi, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, 'Tersedia', NOW(), NOW())
            `;

            // Pastikan tidak ada undefined yang dikirimkan
            const result = await db.execute(insertTiketQuery, [
                kategori || null,
                nama_acara || null,
                lokasi || null,
                tanggal_acara || null,
                poster || null,
                deskripsi || null
            ]);
            const newTiketId = result[0].insertId;

            // Menyisipkan data paket terkait dari Paket_Diajukan ke Paket
            const insertPaketQuery = `
                INSERT INTO Paket (id_tiket, nama_paket, harga_paket, gambar_venue, deskripsi_paket, created_at, updated_at)
                SELECT ?, nama_paket, harga_paket, gambar_venue, deskripsi_paket, NOW(), NOW()
                FROM Paket_Diajukan
                WHERE nik = ?
            `;
            await db.execute(insertPaketQuery, [newTiketId, nik]);
        }

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
