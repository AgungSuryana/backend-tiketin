const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db/connection");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

// Configuring CORS options
const corsOptions = {
    origin: "http://localhost:3000", // Ganti dengan domain yang diizinkan
    methods: ["GET", "POST", "PUT", "DELETE"], // Metode HTTP yang diizinkan
    allowedHeaders: ["Content-Type", "Authorization"], // Header yang diizinkan
    credentials: true, // Menyediakan opsi untuk menerima cookies atau data otentikasi
};

// Middleware
app.use(cors(corsOptions));  // Menggunakan middleware dengan opsi CORS yang sudah dikonfigurasi
app.use(cookieParser());    // Middleware untuk parsing cookies
app.use(bodyParser.json());  // Untuk parsing request body yang berformat JSON

// Database Connection Test
db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to the database");
    }
});

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

// Default route for undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "An unexpected error occurred" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
