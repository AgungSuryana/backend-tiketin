const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "bpu871t0hx7db2sl1v8u-mysql.services.clever-cloud.com",
    user: "uvhda4dehpdmuhys",
    password: "WpUZ18HSrgTr6bLsRiRn",
    database: "bpu871t0hx7db2sl1v8u",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Gunakan pool.promise() untuk mendapatkan fungsi yang mendukung async/await
module.exports = pool.promise();
