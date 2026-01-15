const db = require('../db');

async function checkPaymentTypes() {
    try {
        const [rows] = await db.query(`
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'payments' 
            AND COLUMN_NAME = 'type'
        `);

        console.log('Payment type column definition:');
        console.log(rows[0].COLUMN_TYPE);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkPaymentTypes();
