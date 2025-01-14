const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "bpu871t0hx7db2sl1v8u-mysql.services.clever-cloud.com",
    user: "uvhda4dehpdmuhys",
    password: "WpUZ18HSrgTr6bLsRiRn",
    database: "bpu871t0hx7db2sl1v8u",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to the database!');
    }
});

module.exports = db;
