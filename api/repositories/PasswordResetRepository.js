const db = require('../db');

class PasswordResetRepository {
    async create(email, token, expiresAt) {
        // expiresAt can be passed or handled by SQL. Controller used DATE_ADD(NOW(), INTERVAL 1 HOUR)
        // Let's stick to DB time for consistency with original code
        await db.execute(
            'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
            [email, token]
        );
    }

    async findActiveTokens() {
        // Original code selects recent ones.
        const [rows] = await db.execute(
            'SELECT * FROM password_resets WHERE expires_at > NOW() ORDER BY created_at DESC LIMIT 10'
        );
        return rows;
    }

    async deleteByEmail(email) {
        await db.execute('DELETE FROM password_resets WHERE email = ?', [email]);
    }
}

module.exports = new PasswordResetRepository();
