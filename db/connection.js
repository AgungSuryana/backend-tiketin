const mysql = require("mysql");
require("dotenv").config();

const mysql = require('mysql2');

const db = mysql.createConnection("mysql://uvhda4dehpdmuhys:WpUZ18HSrgTr6bLsRiRn@bpu871t0hx7db2sl1v8u-mysql.services.clever-cloud.com:3306/bpu871t0hx7db2sl1v8u");

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

module.exports = db;
