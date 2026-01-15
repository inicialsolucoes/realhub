const db = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sql = fs.readFileSync(
            path.join(__dirname, 'migrations', '014_add_pending_payment_type.sql'),
            'utf8'
        );

        console.log('Executing migration 014_add_pending_payment_type.sql...');
        await db.query(sql);
        console.log('✓ Migration completed successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
