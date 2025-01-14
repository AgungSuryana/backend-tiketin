const jwt = require("jsonwebtoken");

// JWT Secret hardcoded (gunakan dengan hati-hati)
const JWT_SECRET = "agungsur1807";

// Middleware untuk memverifikasi token
exports.authenticateToken = (req, res, next) => {
    // Ambil token dari header Authorization atau cookies
    const authHeader = req.headers["authorization"];
    const token = authHeader ? authHeader.split(" ")[1] : req.cookies?.token;

    if (!token) {
        return res.status(401).json({ message: "Access token is missing. Please log in." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification error:", err.message);
            return res.status(403).json({ message: "Invalid or expired token. Please log in again." });
        }

        // Simpan informasi user dari token ke dalam req.user
        req.user = user;
        next();
    });
};

// Middleware untuk memeriksa role (admin atau role lainnya)
exports.authorizeRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(403).json({ message: "Unauthorized: No user information found in request." });
        }

        if (req.user.role !== role) {
            return res.status(403).json({
                message: `Access denied: You must be a ${role.charAt(0).toUpperCase() + role.slice(1)} to perform this action.`,
            });
        }

        next();
    };
};
