const jwt = require('jsonwebtoken');

// Middleware untuk memverifikasi token
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token missing' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Salah Token' });
        req.user = user;  // Simpan informasi user dari token ke dalam req.user
        next();
    });
};

// Middleware untuk memeriksa role (admin atau role lainnya)
exports.authorizeRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json({ message: 'Akses dilarang: Anda Bukan ' + role.charAt(0).toUpperCase() + role.slice(1) });
        }
        next();
    };
};
