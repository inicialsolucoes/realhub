const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { logAction } = require('../utils/logger');
const { sendResetEmail } = require('../utils/mailer');

exports.register = async (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        // Auto-assign role 'morador' (user) for self-registration
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, 'user']
        );

        // LOG REGISTER
        await logAction(result.insertId, 'REGISTER', 'user', result.insertId, { name, email }, req.ip);

        res.status(201).send({ message: 'User registered successfully!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send({ message: 'Email already in use!' });
        }
        res.status(500).send({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(404).send({ message: 'User not found.' });
        }

        const user = rows[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ accessToken: null, message: 'Invalid Password!' });
        }

        // Restriction: Resident MUST have a linked unit
        if (user.role === 'user' && !user.unit_id) {
            return res.status(403).send({ message: 'Acesso negado. Sua conta ainda não possui uma unidade vinculada. Entre em contato com a administração.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, unit_id: user.unit_id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: 86400 } // 24 hours
        );

        // LOG LOGIN
        await logAction(user.id, 'LOGIN', 'user', user.id, { email: user.email }, req.ip);

        res.status(200).send({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            unit_id: user.unit_id,
            accessToken: token
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.execute('SELECT id, name FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Return 200 even if user not found for security
            return res.status(200).send({ message: 'Se existir uma conta com este email, as instruções foram enviadas.' });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(token, 8);

        // Save token using DB time for consistency
        await db.execute(
            'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
            [email, hashedToken]
        );

        // Send email
        await sendResetEmail(email, token);

        await logAction(user.id, 'FORGOT_PASSWORD_REQUEST', 'user', user.id, { email }, req.ip);

        res.status(200).send({ message: 'Se existir uma conta com este email, as instruções foram enviadas.' });
    } catch (error) {
        console.error('ForgotPassword error:', error);
        res.status(500).send({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).send({ message: 'Token e senha são obrigatórios.' });
    }

    try {
        // Find all resets for this token (we'll need to check hash)
        // Optimization: we could just get recent ones, but tokens are random/unique enough.
        const [resets] = await db.execute(
            'SELECT * FROM password_resets WHERE expires_at > NOW() ORDER BY created_at DESC LIMIT 10'
        );

        let validReset = null;
        for (const reset of resets) {
            const isMatch = await bcrypt.compare(token, reset.token);
            if (isMatch) {
                validReset = reset;
                break;
            }
        }

        if (!validReset) {
            return res.status(400).send({ message: 'Token inválido ou expirado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);

        // Update user password
        const [userResult] = await db.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, validReset.email]
        );

        if (userResult.affectedRows > 0) {
            // Get user ID for logging
            const [users] = await db.execute('SELECT id FROM users WHERE email = ?', [validReset.email]);
            const userId = users[0].id;

            // Delete used token
            await db.execute('DELETE FROM password_resets WHERE email = ?', [validReset.email]);

            console.log(`[DEBUG] Logging PASSWORD_RESET for user ${userId}, email ${validReset.email}`);
            try {
                await logAction(userId, 'PASSWORD_RESET', 'user', userId, { email: validReset.email }, req.ip);
                console.log('[DEBUG] logAction finished successfully');
            } catch (logErr) {
                console.error('[DEBUG] logAction FAILED:', logErr);
            }

            res.status(200).send({ message: 'Senha alterada com sucesso!' });
        } else {
            res.status(404).send({ message: 'Usuário não encontrado.' });
        }
    } catch (error) {
        console.error('ResetPassword error:', error);
        res.status(500).send({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    // Note: Since we use JWT, logout is mostly handled client-side by deleting the token.
    // However, we log the intent if the client hits this endpoint.
    try {
        // Authenticated routes pass req.userId
        if (req.userId) {
            await logAction(req.userId, 'LOGOUT', 'user', req.userId, null, req.ip);
        }
        res.status(200).send({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};
