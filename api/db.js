const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

if (process.env.TIMEZONE) {
    process.env.TZ = process.env.TIMEZONE;
}

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: 'Z',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
