const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db/connection");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

const corsOptions = {
    origin: "https://frontend-tiketin.vercel.app/", // Ganti dengan domain yang diizinkan
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

// db.connect((err) => {
//     if (err) {
//         console.error("Database connection failed:", err.message);
//     } else {
//         console.log("Connected to the database");
//     }
// });

const usersRoutes = require("./routes/users");
const tiketRoutes = require("./routes/tiket");
const paketRoutes = require("./routes/paket");
const kategoriRoutes = require("./routes/kategori");
const paketajukanRoutes = require("./routes/paket_ajukan");
const tiketajukanRoutes = require("./routes/tiket_ajukan");

app.use("/api/users", usersRoutes);
app.use("/api/tiket", tiketRoutes);
app.use("/api/paket", paketRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/tiketajukan", tiketajukanRoutes);
app.use("/api/paketajukan", paketajukanRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "An unexpected error occurred" });
});

module.exports = app; // Ekspor aplikasi tanpa memanggil app.listen