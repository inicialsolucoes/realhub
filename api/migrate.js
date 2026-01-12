const fs = require('fs');
const path = require('path');
const db = require('./db');

const migrate = async () => {
    try {
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir).sort();

        console.log('Running migrations...');

        for (const file of files) {
            if (file.endsWith('.sql')) {
                console.log(`Executing ${file}...`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                // Split by semicolon to handle multiple statements if any, though our files are single CREATE TABLE generally.
                // But better to execute as whole script if possible or simple execute.
                // basic db.execute might fail on multiple statements if not enabled.
                // For safety, we assume one major statement per file or use multiple calls.

                await db.query(sql); // .query is often better for DDL than .execute
                console.log(`Completed ${file}`);
            }
        }

        console.log('All migrations executed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
