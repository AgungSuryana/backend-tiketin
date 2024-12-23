const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db/connection");
const app = express();
require("dotenv").config();

// Configuring CORS options
const corsOptions = {
    origin: "http://localhost:3000", // Ganti dengan domain yang diizinkan
    methods: "GET, POST, PUT, DELETE", // Metode HTTP yang diizinkan
    allowedHeaders: "Content-Type, Authorization", // Header yang diizinkan
    credentials: true, // Menyediakan opsi untuk menerima cookies atau data otentikasi
};

// Middleware
app.use(cors(corsOptions));  // Menggunakan middleware dengan opsi CORS yang sudah dikonfigurasi
app.use(bodyParser.json());  // Untuk parsing request body yang berformat JSON

// Routes
const usersRoutes = require("./routes/users");
const tiketRoutes = require("./routes/tiket");
const paketRoutes = require("./routes/paket");
const kategoriRoutes = require("./routes/kategori");
const paketajukanRoutes = require("./routes/paket_ajukan");
const tiketajukanRoutes = require("./routes/tiket_ajukan");



// const transaksiRoutes = require("./routes/transaksi");
// const metodePembayaranRoutes = require("./routes/metode_pembayaran");

// Register routes
app.use("/api/users", usersRoutes);
app.use("/api/tiket", tiketRoutes);
app.use("/api/paket", paketRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/tiketajukan", tiketajukanRoutes);
app.use("/api/paketajukan", paketajukanRoutes);

// app.use("/api/transaksi", transaksiRoutes);
// app.use("/api/metode_pembayaran", metodePembayaranRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
