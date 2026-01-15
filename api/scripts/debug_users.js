const db = require('./api/db');

async function checkUsers() {
    try {
        console.log('Checking users in DB...');
        const [users] = await db.query('SELECT * FROM users');
        console.log('Users found:', users.length);
        console.log(users);

        console.log('--- Testing Controller Query ---');
        let query = `
        SELECT u.id, u.name, u.email, u.phone, u.role, u.unit_id, u.created_at,
               un.quadra, un.lote, un.casa
        FROM users u
        LEFT JOIN units un ON u.unit_id = un.id
    `;
        const [rows] = await db.query(query);
        console.log('Controller Query Rows:', rows.length);
        console.log(rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsers();
