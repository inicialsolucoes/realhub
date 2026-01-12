const db = require('./db');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    const email = 'admin@realhub.com';
    const password = 'admin'; // Change this in production

    try {
        const hashedPassword = await bcrypt.hash(password, 8);

        // Check if admin exists
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length > 0) {
            console.log('Admin user already exists.');
            // Update to be sure it is admin
            await db.execute('UPDATE users SET role = "admin" WHERE email = ?', [email]);
            console.log('Ensure role is admin.');
        } else {
            await db.execute(
                'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
                ['Administrador', email, hashedPassword, '000000000', 'admin']
            );
            console.log(`Admin user created.\nEmail: ${email}\nPassword: ${password}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Failed to seed admin:', error);
        process.exit(1);
    }
};

seedAdmin();
