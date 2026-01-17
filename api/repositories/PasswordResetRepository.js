const db = require('../db');

class PasswordResetRepository {
    async create(email, token) {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
        await db.execute(
            'INSERT INTO password_resets (email, token, expires_at, created_at) VALUES (?, ?, ?, ?)',
            [email, token, expiresAt, now]
        );
    }

    async findActiveTokens() {
        const now = new Date();
        const [rows] = await db.execute(
            'SELECT * FROM password_resets WHERE expires_at > ? ORDER BY created_at DESC LIMIT 10',
            [now]
        );
        return rows;
    }

    async deleteByEmail(email) {
        await db.execute('DELETE FROM password_resets WHERE email = ?', [email]);
    }
}

module.exports = new PasswordResetRepository();
