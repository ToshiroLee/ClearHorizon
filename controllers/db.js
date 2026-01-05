require('dotenv').config();
const mysql = require('mysql2');

// Create connection pool instead of single connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: process.env.DB_PORT || 3306,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'clearhorizon',
    connectionLimit: 10, // Limit the pool size
    acquireTimeout: 60000, // 60 seconds
    queueLimit: 0,
    multipleStatements: false
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database pool');
    connection.release(); // Release the connection back to the pool
});

module.exports = pool;