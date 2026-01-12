const db = require('./api/db');

async function checkUsersParametrized() {
    try {
        console.log('--- Testing Parametrized Query ---');

        // Mimic the controller logic completely
        const params = [];
        const conditions = []; // Empty for now

        let query = `
        SELECT u.id, u.name, u.email, u.phone, u.role, u.unit_id, u.created_at,
               un.quadra, un.lote, un.casa
        FROM users u
        LEFT JOIN units un ON u.unit_id = un.id
    `;

        // Order and Limit
        query += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';

        // Add limit/offset to params
        const queryParams = [...params, 10, 0];

        console.log('Query:', query);
        console.log('Params:', queryParams);

        const [rows] = await db.query(query, queryParams);
        console.log('Rows found:', rows.length);
        console.log(rows);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkUsersParametrized();
